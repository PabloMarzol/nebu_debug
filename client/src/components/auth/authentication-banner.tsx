import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, Smartphone, CreditCard, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export default function AuthenticationBanner() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-200">Welcome to NebulaX!</span>
            <span className="text-blue-700 dark:text-blue-300 ml-2">
              Create an account to start trading with advanced security features.
            </span>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/auth/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const getPendingTasks = () => {
    const tasks = [];
    
    if (!user?.emailVerified) {
      tasks.push({
        icon: Mail,
        title: "Verify Email",
        description: "Complete email verification to secure your account",
        href: "/auth/verify-email",
        priority: "high"
      });
    }
    
    if (!user?.kycLevel || user.kycLevel === 0) {
      tasks.push({
        icon: CreditCard,
        title: "Complete KYC",
        description: "Verify your identity to unlock trading features",
        href: "/auth/kyc",
        priority: "high"
      });
    }
    
    if (!user?.twoFactorEnabled) {
      tasks.push({
        icon: Shield,
        title: "Enable 2FA",
        description: "Add two-factor authentication for enhanced security",
        href: "/auth/setup-2fa",
        priority: "medium"
      });
    }
    
    if (!user?.phoneVerified) {
      tasks.push({
        icon: Smartphone,
        title: "Verify Phone",
        description: "Add phone verification for additional security",
        href: "/sms",
        priority: "low"
      });
    }
    
    return tasks;
  };

  const pendingTasks = getPendingTasks();
  const highPriorityTasks = pendingTasks.filter(task => task.priority === "high");

  // If all high priority tasks are complete, don't show banner
  if (highPriorityTasks.length === 0) {
    return null;
  }

  // Show the most important task
  const nextTask = highPriorityTasks[0];
  const Icon = nextTask.icon;

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
      <Icon className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {nextTask.title} Required
            </span>
            <span className="text-yellow-700 dark:text-yellow-300 ml-2">
              {nextTask.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-yellow-300">
              {pendingTasks.length} task{pendingTasks.length > 1 ? 's' : ''} pending
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Link href={nextTask.href}>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              {nextTask.title}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          <Link href="/auth/dashboard">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}