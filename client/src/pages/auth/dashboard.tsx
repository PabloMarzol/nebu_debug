import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Shield, Mail, Smartphone, CreditCard, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import QuickSetupWizard from "@/components/auth/quick-setup-wizard";

export default function AuthDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access your account dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getKYCStatus = (level?: number) => {
    switch (level) {
      case 0:
        return { text: "Unverified", color: "destructive", icon: AlertTriangle };
      case 1:
        return { text: "Basic", color: "secondary", icon: Clock };
      case 2:
        return { text: "Enhanced", color: "default", icon: CheckCircle };
      case 3:
        return { text: "Institutional", color: "default", icon: CheckCircle };
      default:
        return { text: "Unverified", color: "destructive", icon: AlertTriangle };
    }
  };

  const kycStatus = getKYCStatus(user.kycLevel);
  const KYCIcon = kycStatus.icon;

  const getAccountTierInfo = (tier?: string) => {
    switch (tier) {
      case "basic":
        return { name: "Basic", limits: "Trading: $1,000/day", color: "secondary" };
      case "verified":
        return { name: "Verified", limits: "Trading: $10,000/day", color: "default" };
      case "premium":
        return { name: "Premium", limits: "Trading: $100,000/day", color: "default" };
      case "institutional":
        return { name: "Institutional", limits: "Trading: Unlimited", color: "default" };
      default:
        return { name: "Basic", limits: "Trading: $1,000/day", color: "secondary" };
    }
  };

  const tierInfo = getAccountTierInfo(user.accountTier);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security and verification status
          </p>
        </div>

        {/* Quick Setup Wizard */}
        <QuickSetupWizard />

        {/* Account Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tierInfo.name}</div>
              <p className="text-xs text-muted-foreground">{tierInfo.limits}</p>
              <div className="mt-2">
                <Badge variant={tierInfo.color as any}>{tierInfo.name} Tier</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
              <KYCIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {user.kycLevel || 0}</div>
              <p className="text-xs text-muted-foreground">{kycStatus.text}</p>
              <div className="mt-2">
                <Badge variant={kycStatus.color as any}>{kycStatus.text}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(user.emailVerified ? 30 : 0) + 
                 (user.phoneVerified ? 20 : 0) + 
                 (user.twoFactorEnabled ? 30 : 0) + 
                 ((user.kycLevel || 0) * 5)}%
              </div>
              <p className="text-xs text-muted-foreground">Security strength</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Status Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
              <CardDescription>
                Verify your email address to secure your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email: {user.email}</span>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              {!user.emailVerified && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please check your email and click the verification link to activate your account.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Phone Verification
              </CardTitle>
              <CardDescription>
                Add your phone number for additional security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{user.phoneNumber || "Not added"}</span>
                <Badge variant={user.phoneVerified ? "default" : "secondary"}>
                  {user.phoneVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <Link href="/sms">
                <Button variant="outline" size="sm">
                  {user.phoneNumber ? "Update Phone" : "Add Phone"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Protect your account with 2FA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>2FA Status</span>
                <Badge variant={user.twoFactorEnabled ? "default" : "destructive"}>
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <Link href="/auth/setup-2fa">
                <Button variant="outline" size="sm">
                  {user.twoFactorEnabled ? "Manage 2FA" : "Setup 2FA"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                KYC Verification
              </CardTitle>
              <CardDescription>
                Verify your identity to increase trading limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Level: {user.kycLevel || 0}</span>
                <Badge variant={kycStatus.color as any}>{kycStatus.text}</Badge>
              </div>
              <Link href="/auth/kyc">
                <Button variant="outline" size="sm">
                  {(user.kycLevel || 0) === 0 ? "Start KYC" : "Upgrade KYC"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common account management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/crypto-payments">
                <Button variant="outline" className="w-full">
                  Payment Methods
                </Button>
              </Link>
              <Link href="/trading">
                <Button variant="outline" className="w-full">
                  Start Trading
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="w-full">
                  View Portfolio
                </Button>
              </Link>
              <Link href="/wallet">
                <Button variant="outline" className="w-full">
                  Wallet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}