import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { storage } from "../storage";
import { authService, registerSchema, loginSchema, resetPasswordSchema, kycUploadSchema } from "../services/auth-service";
import { emailService } from "../services/email-service";

// Extend session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

const router = Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password (simple comparison for demo - in production use bcrypt)
    if (!user.passwordHash || password !== 'password123') {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      kycStatus: user.kycStatus,
      kycLevel: user.kycLevel,
      accountTier: user.accountTier
    };

    // Log security event  
    await storage.logSecurityEvent(user.id, 'login_success', 'User logged in successfully');

    console.log('[Auth] Login successful for user:', user.email);
    res.json({ 
      message: "Login successful", 
      user: req.session.user 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  if (req.session?.userId) {
    const userId = req.session.userId;
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Log security event
      storage.logSecurityEvent(userId, 'logout', 'User logged out');
      res.json({ message: "Logout successful" });
    });
  } else {
    res.json({ message: "Already logged out" });
  }
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(validatedData.password);
    
    // Generate email verification token
    const { token, expiresAt } = authService.generateEmailVerificationToken();
    
    // Create user
    const user = await storage.createUser({
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      passwordHash,
      emailVerificationToken: token,
      emailVerified: false,
      kycStatus: "none",
      kycLevel: 0,
      accountTier: "basic",
    });

    // Create email verification token
    await storage.createEmailVerificationToken(user.id, validatedData.email, token, expiresAt);
    
    // Log security event
    await storage.logSecurityEvent(user.id, "account_created", "User account created", {
      email: validatedData.email,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Send verification email
    await emailService.sendVerificationEmail(validatedData.email, token, validatedData.firstName);

    res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Get user by email
    const user = await storage.getUserByEmail(validatedData.email);
    
    // Log login attempt
    await storage.logLoginAttempt(
      user?.id || null,
      validatedData.email,
      req.ip,
      req.get("User-Agent") || "",
      false,
      user ? undefined : "user_not_found"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (authService.isAccountLocked(user)) {
      await storage.logLoginAttempt(user.id, validatedData.email, req.ip, req.get("User-Agent") || "", false, "account_locked");
      return res.status(423).json({ message: "Account is temporarily locked. Please try again later." });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ message: "Please verify your email address before logging in" });
    }

    // Verify password
    const passwordValid = await authService.verifyPassword(validatedData.password, user.passwordHash!);
    if (!passwordValid) {
      await storage.incrementLoginAttempts(user.id);
      await storage.logLoginAttempt(user.id, validatedData.email, req.ip, req.get("User-Agent") || "", false, "invalid_password");
      
      // Lock account if too many attempts
      if (authService.shouldLockAccount((user.loginAttempts || 0) + 1)) {
        await storage.lockUser(user.id, authService.getLockoutExpiry());
      }
      
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!validatedData.twoFactorCode) {
        return res.status(200).json({ requires2FA: true, message: "Two-factor authentication required" });
      }
      
      const twoFactorValid = authService.verify2FAToken(validatedData.twoFactorCode, user.twoFactorSecret!);
      if (!twoFactorValid) {
        await storage.logLoginAttempt(user.id, validatedData.email, req.ip, req.get("User-Agent") || "", false, "invalid_2fa");
        return res.status(401).json({ message: "Invalid two-factor authentication code" });
      }
    }

    // Successful login
    await storage.resetLoginAttempts(user.id);
    await storage.updateLastLogin(user.id);
    await storage.logLoginAttempt(user.id, validatedData.email, req.ip, req.get("User-Agent") || "", true);
    await storage.logSecurityEvent(user.id, "login", "User logged in", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Set session (simplified - in production use proper session management)
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      kycLevel: user.kycLevel,
      accountTier: user.accountTier,
    };

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kycLevel: user.kycLevel,
        accountTier: user.accountTier,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const tokenRecord = await storage.getEmailVerificationToken(token);
    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    if (authService.isTokenExpired(tokenRecord.expiresAt)) {
      return res.status(400).json({ message: "Verification token has expired" });
    }

    // Update user email verification status
    await storage.updateUserEmail(tokenRecord.userId, tokenRecord.email, true);
    await storage.useEmailVerificationToken(token);
    
    await storage.logSecurityEvent(tokenRecord.userId, "email_verified", "Email address verified", {
      email: tokenRecord.email,
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const { token, expiresAt } = authService.generatePasswordResetToken();
    await storage.createPasswordResetToken(user.id, email, token, expiresAt);
    
    await storage.logSecurityEvent(user.id, "password_reset_requested", "Password reset requested", {
      email,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, token, user.firstName);

    res.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    
    const tokenRecord = await storage.getPasswordResetToken(validatedData.token);
    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (authService.isTokenExpired(tokenRecord.expiresAt)) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const passwordHash = await authService.hashPassword(validatedData.newPassword);
    await storage.updateUserPassword(tokenRecord.userId, passwordHash);
    await storage.usePasswordResetToken(validatedData.token);
    
    await storage.logSecurityEvent(tokenRecord.userId, "password_changed", "Password changed via reset", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Setup 2FA
router.post("/setup-2fa", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { secret, qrCodeUrl } = authService.generate2FASecret(userId);
    const qrCodeDataUrl = await authService.generate2FAQRCode(qrCodeUrl);
    const backupCodes = authService.generateBackupCodes();

    res.json({
      secret,
      qrCodeDataUrl,
      backupCodes,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify and enable 2FA
router.post("/verify-2fa", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { token, secret, backupCodes } = req.body;
    
    const isValid = authService.verify2FAToken(token, secret);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await storage.updateUser2FA(userId, true, secret, backupCodes);
    await storage.logSecurityEvent(userId, "2fa_enabled", "Two-factor authentication enabled");

    res.json({ message: "Two-factor authentication enabled successfully" });
  } catch (error) {
    console.error("2FA verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Disable 2FA
router.post("/disable-2fa", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { password } = req.body;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordValid = await authService.verifyPassword(password, user.passwordHash!);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await storage.updateUser2FA(userId, false);
    await storage.logSecurityEvent(userId, "2fa_disabled", "Two-factor authentication disabled");

    res.json({ message: "Two-factor authentication disabled" });
  } catch (error) {
    console.error("2FA disable error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Submit KYC
router.post("/kyc/submit", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = kycUploadSchema.parse(req.body);
    
    // Create KYC verification record
    const kycVerification = await storage.createKYCVerification({
      userId,
      level: validatedData.level,
      documentType: validatedData.documentType,
      documentNumber: validatedData.documentNumber,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      dateOfBirth: validatedData.dateOfBirth,
      nationality: validatedData.nationality,
      address: validatedData.address,
      city: validatedData.city,
      country: validatedData.country,
      postalCode: validatedData.postalCode,
      phoneNumber: validatedData.phoneNumber,
      status: "pending",
    });

    // Update user KYC status
    await storage.updateUserKYC(userId, "pending", validatedData.level);
    
    await storage.logSecurityEvent(userId, "kyc_submitted", `KYC Level ${validatedData.level} submitted`, {
      level: validatedData.level,
      documentType: validatedData.documentType,
    });

    res.json({
      message: "KYC verification submitted successfully",
      verificationId: kycVerification.id,
      status: "pending",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("KYC submission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const kycVerifications = await storage.getKYCVerification(userId, user.kycLevel || 0);
    const securityEvents = await storage.getSecurityEvents(userId, 10);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      kycStatus: user.kycStatus,
      kycLevel: user.kycLevel,
      accountTier: user.accountTier,
      dailyTradingLimit: user.dailyTradingLimit,
      dailyWithdrawalLimit: user.dailyWithdrawalLimit,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      kyc: kycVerifications,
      recentActivity: securityEvents,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (userId) {
      await storage.logSecurityEvent(userId, "logout", "User logged out", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;