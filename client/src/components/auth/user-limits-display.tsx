import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Shield, CreditCard, ArrowUp } from "lucide-react";

export default function UserLimitsDisplay() {
  const { user, isAuthenticated } = useAuth();

  const { data: tradingStats } = useQuery({
    queryKey: ["/api/trading/stats"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const getLimitInfo = (kycLevel: number, accountTier: string) => {
    const limits = {
      0: { daily: 1000, withdrawal: 500, name: "Basic" },
      1: { daily: 10000, withdrawal: 5000, name: "Verified" },
      2: { daily: 100000, withdrawal: 50000, name: "Enhanced" },
      3: { daily: "unlimited", withdrawal: 500000, name: "Institutional" },
    };

    return limits[kycLevel as keyof typeof limits] || limits[0];
  };

  const limitInfo = getLimitInfo(user.kycLevel || 0, user.accountTier || "basic");
  const dailyUsed = tradingStats?.dailyVolume || 0;
  const dailyLimit = typeof limitInfo.daily === "number" ? limitInfo.daily : 1000000;
  const usagePercentage = typeof limitInfo.daily === "number" ? (dailyUsed / limitInfo.daily) * 100 : 0;

  const canUpgrade = (user.kycLevel || 0) < 3;
  const nextLevel = (user.kycLevel || 0) + 1;
  const nextLimitInfo = getLimitInfo(nextLevel, user.accountTier || "basic");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading Limits
        </CardTitle>
        <CardDescription>
          Current usage and available limits for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Account Level</span>
          <Badge variant="default">
            <Shield className="h-3 w-3 mr-1" />
            {limitInfo.name} (KYC {user.kycLevel || 0})
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Trading Volume</span>
            <span>
              ${dailyUsed.toLocaleString()} / {typeof limitInfo.daily === "number" ? `$${limitInfo.daily.toLocaleString()}` : "Unlimited"}
            </span>
          </div>
          {typeof limitInfo.daily === "number" && (
            <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Withdrawal Limit</span>
            <span>${limitInfo.withdrawal.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <div className="font-medium mb-1">Features Available:</div>
            <ul className="space-y-1">
              <li>• Spot Trading</li>
              {(user.kycLevel || 0) >= 2 && <li>• P2P Trading</li>}
              {(user.kycLevel || 0) >= 3 && <li>• OTC Trading</li>}
              <li>• Staking</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">Security Features:</div>
            <ul className="space-y-1">
              <li className={user.emailVerified ? "text-green-600" : "text-red-600"}>
                • Email {user.emailVerified ? "✓" : "✗"}
              </li>
              <li className={user.phoneVerified ? "text-green-600" : "text-red-600"}>
                • Phone {user.phoneVerified ? "✓" : "✗"}
              </li>
              <li className={user.twoFactorEnabled ? "text-green-600" : "text-red-600"}>
                • 2FA {user.twoFactorEnabled ? "✓" : "✗"}
              </li>
            </ul>
          </div>
        </div>

        {canUpgrade && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Upgrade to Level {nextLevel}</span>
              <Badge variant="outline">
                <ArrowUp className="h-3 w-3 mr-1" />
                {nextLimitInfo.name}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Get ${typeof nextLimitInfo.daily === "number" ? nextLimitInfo.daily.toLocaleString() : "unlimited"} daily trading limit
              {nextLevel >= 2 && " + P2P Trading"}
              {nextLevel >= 3 && " + OTC Trading"}
            </div>
            <Link href="/auth/kyc">
              <Button size="sm" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to KYC Level {nextLevel}
              </Button>
            </Link>
          </div>
        )}

        {usagePercentage > 80 && typeof limitInfo.daily === "number" && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <Shield className="h-4 w-4" />
              You've used {usagePercentage.toFixed(0)}% of your daily limit
            </div>
            {canUpgrade && (
              <Link href="/auth/kyc">
                <Button size="sm" variant="outline" className="mt-2 w-full">
                  Upgrade for Higher Limits
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}