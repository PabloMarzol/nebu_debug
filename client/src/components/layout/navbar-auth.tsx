import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Shield, CreditCard, Settings } from "lucide-react";

export default function NavbarAuth() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out.",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/login">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/auth/register">
          <Button>Get Started</Button>
        </Link>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getKYCStatus = (level?: number) => {
    switch (level) {
      case 0:
        return { text: "Unverified", color: "text-red-600" };
      case 1:
        return { text: "Basic", color: "text-yellow-600" };
      case 2:
        return { text: "Enhanced", color: "text-blue-600" };
      case 3:
        return { text: "Institutional", color: "text-green-600" };
      default:
        return { text: "Unverified", color: "text-red-600" };
    }
  };

  const kycStatus = getKYCStatus(user?.kycLevel);

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-4">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">KYC:</span>
                <span className={`text-xs font-medium ${kycStatus.color}`}>
                  {kycStatus.text}
                </span>
                {!user?.emailVerified && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Email not verified
                  </span>
                )}
                {user?.twoFactorEnabled && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    2FA
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/auth/kyc">
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>KYC Verification</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/auth/setup-2fa">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Security Settings</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/crypto-payments">
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Payment Methods</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}