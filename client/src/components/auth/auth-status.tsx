import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Shield, Mail, AlertTriangle, CheckCircle, Lock, CreditCard } from "lucide-react";

interface AuthStatusProps {
  requiredKYC?: number;
  requiredFeatures?: string[];
  showActions?: boolean;
}

export default function AuthStatus({ 
  requiredKYC = 0, 
  requiredFeatures = [], 
  showActions = true 
}: AuthStatusProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Please log in to access trading features</span>
          {showActions && (
            <div className="flex gap-2 ml-4">
              <Link href="/auth/login">
                <Button size="sm" variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  const missingRequirements = [];

  // Check email verification
  if (!user?.emailVerified) {
    missingRequirements.push({
      title: "Email Verification Required",
      description: "Verify your email address to continue",
      action: "Verify Email",
      href: "/auth/verify-email",
      icon: Mail
    });
  }

  // Check KYC level
  if (requiredKYC > 0 && (!user?.kycLevel || user.kycLevel < requiredKYC)) {
    missingRequirements.push({
      title: `KYC Level ${requiredKYC} Required`,
      description: `Current level: ${user?.kycLevel || 0}. Upgrade needed for this feature.`,
      action: "Complete KYC",
      href: "/auth/kyc",
      icon: CreditCard
    });
  }

  // Check 2FA for features that require it
  if (requiredFeatures.includes('2fa') && !user?.twoFactorEnabled) {
    missingRequirements.push({
      title: "Two-Factor Authentication Required",
      description: "Enable 2FA for enhanced security on this feature",
      action: "Setup 2FA",
      href: "/auth/setup-2fa",
      icon: Lock
    });
  }

  if (missingRequirements.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>All requirements met. You can access all trading features.</span>
          {showActions && (
            <Link href="/auth/dashboard">
              <Button size="sm" variant="outline">Account Dashboard</Button>
            </Link>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
          <CardDescription>
            Complete the following requirements to access all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(user?.emailVerified)}
                <span className="text-sm">Email Verified</span>
              </div>
              {getStatusBadge(user?.emailVerified, "Verified", "Not Verified")}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(user?.phoneVerified)}
                <span className="text-sm">Phone Verified</span>
              </div>
              {getStatusBadge(user?.phoneVerified, "Verified", "Not Verified")}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(user?.twoFactorEnabled)}
                <span className="text-sm">2FA Enabled</span>
              </div>
              {getStatusBadge(user?.twoFactorEnabled, "Enabled", "Disabled")}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon((user?.kycLevel || 0) >= requiredKYC)}
                <span className="text-sm">KYC Level {user?.kycLevel || 0}</span>
              </div>
              <Badge variant={(user?.kycLevel || 0) >= requiredKYC ? "default" : "secondary"}>
                Level {user?.kycLevel || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {missingRequirements.map((requirement, index) => {
        const Icon = requirement.icon;
        return (
          <Alert key={index} variant="destructive">
            <Icon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <div className="font-medium">{requirement.title}</div>
                <div className="text-sm opacity-90">{requirement.description}</div>
              </div>
              {showActions && (
                <Link href={requirement.href}>
                  <Button size="sm" variant="outline">
                    {requirement.action}
                  </Button>
                </Link>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}