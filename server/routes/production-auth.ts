import { Router } from "express";
import bcrypt from "bcrypt";
import { Pool } from "@neondatabase/serverless";
import { emailService } from "../services/email-service";

const router = Router();

// Direct database connection for production authentication
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Hash password function using bcrypt for production security
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password function
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Production login with direct database queries
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[Auth] Production login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Demo credentials for development
    if (email === 'demo@nebulax.com' && password === 'password123') {
      req.session.userId = 'demo-user-123';
      req.session.user = {
        id: 'demo-user-123',
        email: 'demo@nebulax.com',
        firstName: 'Demo',
        lastName: 'User',
        emailVerified: true,
        kycStatus: 'verified',
        kycLevel: 2,
        accountTier: 'premium'
      };

      console.log('[Auth] Demo login successful');
      return res.json({ 
        message: "Login successful", 
        user: req.session.user 
      });
    }

    // Look up user in database using direct SQL
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, email_verified, kyc_status, kyc_level, account_tier, login_attempts, locked_until FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('[Auth] User not found:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      console.log('[Auth] Account locked:', email);
      return res.status(401).json({ message: "Account temporarily locked" });
    }

    // Verify password
    if (!user.password_hash) {
      console.log('[Auth] No password hash for user:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('[Auth] Invalid password for:', email);
      
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      
      if (newAttempts >= 5) {
        // Lock account for 15 minutes
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
          'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
          [newAttempts, lockUntil, user.id]
        );
      } else {
        await pool.query(
          'UPDATE users SET login_attempts = $1 WHERE id = $2',
          [newAttempts, user.id]
        );
      }
      
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts and update last login
    await pool.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      kycStatus: user.kyc_status,
      kycLevel: user.kyc_level,
      accountTier: user.account_tier
    };

    console.log('[Auth] Production login successful for:', email);
    
    // Send login notification email (non-blocking)
    const loginDetails = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    emailService.sendLoginNotificationEmail(user.email, user.first_name, loginDetails)
      .then(() => console.log('[Auth] Login notification sent to:', email))
      .catch(err => console.error('[Auth] Login notification failed:', err));
    
    return res.json({ 
      message: "Login successful", 
      user: req.session.user 
    });

  } catch (error) {
    console.error("Production login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Production registration with direct database queries
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    console.log('[Auth] Production registration attempt for:', email);
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if user already exists
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user with direct SQL insert
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password, password_hash, first_name, last_name, email_verified, kyc_status, kyc_level, account_tier) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, first_name, last_name, email_verified, kyc_status, kyc_level, account_tier',
      [userId, email, passwordHash, passwordHash, firstName, lastName, true, 'pending', 1, 'basic']
    );

    const newUser = insertResult.rows[0];

    // Create session immediately after registration
    req.session.userId = newUser.id;
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      emailVerified: newUser.email_verified,
      kycStatus: newUser.kyc_status,
      kycLevel: newUser.kyc_level,
      accountTier: newUser.account_tier
    };

    console.log('[Auth] Production registration successful for:', email);
    
    // Get user IP address for admin notification
    const forwardedFor = req.headers['x-forwarded-for'];
    const userIpAddress = req.ip || req.connection.remoteAddress || 
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || 'Unknown';
    
    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, firstName)
      .then(() => console.log('[Auth] Welcome email sent to:', email))
      .catch(err => console.error('[Auth] Welcome email failed:', err));
    
    // Send signup notification to admin (non-blocking)
    emailService.sendSignupNotification(email, firstName, lastName, userIpAddress)
      .then(() => console.log('[Auth] Signup notification sent to admin for:', email))
      .catch(err => console.error('[Auth] Signup notification failed:', err));
    
    res.status(201).json({
      message: "Account created successfully. You are now logged in!",
      user: req.session.user
    });
  } catch (error) {
    console.error("Production registration error:", error);
    res.status(500).json({ 
      message: "Registration failed",
      error: error.message 
    });
  }
});

// Get current user
router.get("/user", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  res.json(req.session.user);
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

export default router;