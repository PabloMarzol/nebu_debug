import { useAuth } from "./useAuth";

interface AuthRequirements {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  minKYCLevel?: number;
  minAccountTier?: string;
}

interface AuthStatusResult {
  canAccess: boolean;
  missingRequirements: string[];
  userStatus: {
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    kycLevel: number;
    accountTier: string;
  };
}

export function useAuthStatus(requirements: AuthRequirements = {}): AuthStatusResult {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return {
      canAccess: false,
      missingRequirements: ["authentication"],
      userStatus: {
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        kycLevel: 0,
        accountTier: "basic",
      },
    };
  }

  const userStatus = {
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
    kycLevel: user.kycLevel || 0,
    accountTier: user.accountTier || "basic",
  };

  const missingRequirements: string[] = [];

  // Check email verification
  if (requirements.emailVerified && !userStatus.emailVerified) {
    missingRequirements.push("email_verification");
  }

  // Check phone verification
  if (requirements.phoneVerified && !userStatus.phoneVerified) {
    missingRequirements.push("phone_verification");
  }

  // Check 2FA
  if (requirements.twoFactorEnabled && !userStatus.twoFactorEnabled) {
    missingRequirements.push("two_factor_authentication");
  }

  // Check KYC level
  if (requirements.minKYCLevel && userStatus.kycLevel < requirements.minKYCLevel) {
    missingRequirements.push(`kyc_level_${requirements.minKYCLevel}`);
  }

  // Check account tier
  if (requirements.minAccountTier) {
    const tierHierarchy = {
      basic: 1,
      verified: 2,
      premium: 3,
      institutional: 4,
    };

    const userTierLevel = tierHierarchy[userStatus.accountTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requirements.minAccountTier as keyof typeof tierHierarchy] || 0;

    if (userTierLevel < requiredTierLevel) {
      missingRequirements.push(`account_tier_${requirements.minAccountTier}`);
    }
  }

  return {
    canAccess: missingRequirements.length === 0,
    missingRequirements,
    userStatus,
  };
}

// Predefined requirement sets for common features
export const TRADING_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  minKYCLevel: 1,
};

export const P2P_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  minKYCLevel: 2,
};

export const OTC_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  twoFactorEnabled: true,
  minKYCLevel: 3,
  minAccountTier: "premium",
};

export const STAKING_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  minKYCLevel: 1,
};

export const COPY_TRADING_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  minKYCLevel: 2,
};

export const LAUNCHPAD_REQUIREMENTS: AuthRequirements = {
  emailVerified: true,
  twoFactorEnabled: true,
  minKYCLevel: 2,
  minAccountTier: "verified",
};