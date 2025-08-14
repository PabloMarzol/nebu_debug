import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredKYCLevel?: number;
  requiredAccountTier?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredKYCLevel = 0,
  requiredAccountTier 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (isAuthenticated && user) {
      // Check KYC level requirement
      if (requiredKYCLevel && (user.kycLevel || 0) < requiredKYCLevel) {
        toast({
          title: "KYC verification required",
          description: `This feature requires KYC Level ${requiredKYCLevel} verification.`,
          variant: "destructive",
        });
        navigate("/auth/kyc");
        return;
      }

      // Check account tier requirement
      if (requiredAccountTier && user.accountTier !== requiredAccountTier) {
        toast({
          title: "Account upgrade required",
          description: `This feature requires ${requiredAccountTier} account tier.`,
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Check if email verification is required
      if (!user.emailVerified) {
        toast({
          title: "Email verification required",
          description: "Please verify your email address to continue.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredKYCLevel, requiredAccountTier, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}