import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import { z } from "zod";

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, 
      "Password must contain at least one letter, one number, and one special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, 
      "Password must contain at least one letter, one number, and one special character"),
});

export const kycUploadSchema = z.object({
  level: z.number().min(1).max(3),
  documentType: z.enum(["passport", "driver_license", "national_id"]),
  documentNumber: z.string().min(1, "Document number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(2, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

class AuthService {
  private readonly saltRounds = 12;
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly tokenExpiryDuration = 24 * 60 * 60 * 1000; // 24 hours

  // Password hashing
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Account lockout management
  isAccountLocked(user: any): boolean {
    if (!user.lockedUntil) return false;
    return new Date() < new Date(user.lockedUntil);
  }

  shouldLockAccount(loginAttempts: number): boolean {
    return loginAttempts >= this.maxLoginAttempts;
  }

  getLockoutExpiry(): Date {
    return new Date(Date.now() + this.lockoutDuration);
  }

  // Token generation
  generateEmailVerificationToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryDuration);
    return { token, expiresAt };
  }

  generatePasswordResetToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryDuration);
    return { token, expiresAt };
  }

  isTokenExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
  }

  // Two-Factor Authentication
  generate2FASecret(userId: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `NebulaX (${userId})`,
      issuer: 'NebulaX Exchange',
      length: 32,
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
    };
  }

  async generate2FAQRCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  verify2FAToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (1 minute) of tolerance
    });
  }

  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g)!.join('-'));
    }
    return codes;
  }

  // KYC validation
  validateKYCLevel(level: number): boolean {
    return level >= 1 && level <= 3;
  }

  getKYCLimits(level: number): { dailyTrading: string; dailyWithdrawal: string } {
    switch (level) {
      case 1:
        return { dailyTrading: "10000", dailyWithdrawal: "5000" };
      case 2:
        return { dailyTrading: "100000", dailyWithdrawal: "50000" };
      case 3:
        return { dailyTrading: "unlimited", dailyWithdrawal: "500000" };
      default:
        return { dailyTrading: "1000", dailyWithdrawal: "500" };
    }
  }

  getAccountTierForKYC(level: number): string {
    switch (level) {
      case 0:
        return "basic";
      case 1:
        return "verified";
      case 2:
        return "premium";
      case 3:
        return "institutional";
      default:
        return "basic";
    }
  }

  // Risk assessment
  calculateRiskScore(user: any, metadata: any): number {
    let riskScore = 0;

    // Base risk based on KYC level
    if (!user.kycLevel || user.kycLevel === 0) riskScore += 30;
    else if (user.kycLevel === 1) riskScore += 15;
    else if (user.kycLevel === 2) riskScore += 5;

    // Email verification
    if (!user.emailVerified) riskScore += 20;

    // Phone verification
    if (!user.phoneVerified) riskScore += 10;

    // 2FA enabled
    if (!user.twoFactorEnabled) riskScore += 15;

    // New account (less than 30 days)
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    if (accountAge < 30 * 24 * 60 * 60 * 1000) riskScore += 10;

    // IP-based risk (if available)
    if (metadata?.ipAddress) {
      // This would typically integrate with IP reputation services
      // For now, we'll add a basic check
      if (metadata.ipAddress.startsWith('10.') || 
          metadata.ipAddress.startsWith('192.168.') ||
          metadata.ipAddress === '127.0.0.1') {
        riskScore += 5; // Local/private IPs have slightly higher risk
      }
    }

    return Math.min(riskScore, 100); // Cap at 100
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  // Password strength validation
  validatePasswordStrength(password: string): { 
    isValid: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 20;
    else feedback.push("Use at least 8 characters");

    if (password.length >= 12) score += 10;

    if (/[a-z]/.test(password)) score += 10;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push("Include uppercase letters");

    if (/\d/.test(password)) score += 20;
    else feedback.push("Include numbers");

    if (/[@$!%*#?&]/.test(password)) score += 20;
    else feedback.push("Include special characters");

    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push("Avoid repeating characters");

    return {
      isValid: score >= 70,
      score,
      feedback,
    };
  }

  // Session management helpers
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  isValidSession(sessionData: any): boolean {
    if (!sessionData || !sessionData.userId || !sessionData.expiresAt) {
      return false;
    }
    return new Date() < new Date(sessionData.expiresAt);
  }
}

export const authService = new AuthService();