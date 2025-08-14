import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, Mail, CreditCard, Shield, Clock } from "lucide-react";

interface AuthErrorHandlerProps {
  error: Error;
  onRetry?: () => void;
}

export default function AuthErrorHandler({ error, onRetry }: AuthErrorHandlerProps) {
  const errorMessage = error.message.toLowerCase();

  // Handle email verification errors
  if (errorMessage.includes("email_not_verified") || errorMessage.includes("email verification")) {
    return (
      <Alert variant="destructive">
        <Mail className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">Email Verification Required</div>
            <div className="text-sm opacity-90">Please verify your email address to continue</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/verify-email">
              <Button size="sm" variant="outline">
                Verify Email
              </Button>
            </Link>
            <Link href="/auth/dashboard">
              <Button size="sm">
                Account Dashboard
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle KYC level errors
  if (errorMessage.includes("insufficient_kyc") || errorMessage.includes("kyc")) {
    const requiredLevel = errorMessage.match(/level (\d+)/)?.[1] || "1";
    
    return (
      <Alert variant="destructive">
        <CreditCard className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">KYC Level {requiredLevel} Required</div>
            <div className="text-sm opacity-90">Complete identity verification to access this feature</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/kyc">
              <Button size="sm" variant="outline">
                Complete KYC
              </Button>
            </Link>
            <Link href="/auth/dashboard">
              <Button size="sm">
                View Requirements
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle 2FA errors
  if (errorMessage.includes("2fa_required") || errorMessage.includes("two-factor")) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">Two-Factor Authentication Required</div>
            <div className="text-sm opacity-90">Enable 2FA for enhanced security on this feature</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/setup-2fa">
              <Button size="sm" variant="outline">
                Setup 2FA
              </Button>
            </Link>
            <Link href="/auth/dashboard">
              <Button size="sm">
                Security Settings
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle trading limit errors
  if (errorMessage.includes("daily_limit_exceeded") || errorMessage.includes("trading limit")) {
    return (
      <Alert variant="destructive">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">Daily Trading Limit Exceeded</div>
            <div className="text-sm opacity-90">Upgrade your account or wait until tomorrow to continue trading</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/kyc">
              <Button size="sm" variant="outline">
                Upgrade Account
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button size="sm">
                View Limits
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle account tier errors
  if (errorMessage.includes("insufficient_tier") || errorMessage.includes("account tier")) {
    return (
      <Alert variant="destructive">
        <CreditCard className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">Account Upgrade Required</div>
            <div className="text-sm opacity-90">This feature requires a higher account tier</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/kyc">
              <Button size="sm" variant="outline">
                Upgrade Account
              </Button>
            </Link>
            <Link href="/auth/dashboard">
              <Button size="sm">
                View Options
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Generic authentication error
  if (errorMessage.includes("unauthorized") || errorMessage.includes("authentication")) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">Authentication Required</div>
            <div className="text-sm opacity-90">Please log in to access this feature</div>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Default error handling
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">Error</div>
          <div className="text-sm opacity-90">{error.message}</div>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}