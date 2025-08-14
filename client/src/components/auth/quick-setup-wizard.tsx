import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Circle, Mail, CreditCard, Shield, Smartphone, ArrowRight, Star } from "lucide-react";

export default function QuickSetupWizard() {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isAuthenticated) {
    return null;
  }

  const steps = [
    {
      id: "email",
      title: "Verify Email",
      description: "Secure your account with email verification",
      icon: Mail,
      completed: user?.emailVerified,
      required: true,
      href: "/auth/verify-email"
    },
    {
      id: "kyc",
      title: "Complete KYC",
      description: "Verify your identity to unlock trading",
      icon: CreditCard,
      completed: (user?.kycLevel || 0) >= 1,
      required: true,
      href: "/auth/kyc"
    },
    {
      id: "2fa",
      title: "Enable 2FA",
      description: "Add two-factor authentication",
      icon: Shield,
      completed: user?.twoFactorEnabled,
      required: false,
      href: "/auth/setup-2fa"
    },
    {
      id: "phone",
      title: "Verify Phone",
      description: "Add phone verification",
      icon: Smartphone,
      completed: user?.phoneVerified,
      required: false,
      href: "/sms"
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const nextStep = steps.find(step => !step.completed);

  // Don't show if all steps are complete
  if (completedSteps === totalSteps) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Account Setup Complete!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your account is fully verified and ready for trading. Start exploring all NebulaX features.
              </p>
            </div>
            <Link href="/trading">
              <Button className="bg-green-600 hover:bg-green-700">
                Start Trading
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Account Setup
              <Badge variant="outline">
                {completedSteps}/{totalSteps} Complete
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete these steps to unlock all NebulaX features
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.completed;
            const isCurrent = !isCompleted && step === nextStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  isCurrent ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? "bg-green-100 dark:bg-green-900" 
                    : isCurrent 
                    ? "bg-blue-100 dark:bg-blue-900" 
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon className={`h-5 w-5 ${
                      isCurrent ? "text-blue-600" : "text-gray-400"
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      isCompleted ? "text-green-700 dark:text-green-300" : ""
                    }`}>
                      {step.title}
                    </h4>
                    {step.required && !isCompleted && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="default" className="text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isCompleted 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-muted-foreground"
                  }`}>
                    {step.description}
                  </p>
                </div>
                
                {!isCompleted && (
                  <Link href={step.href}>
                    <Button size="sm" variant={isCurrent ? "default" : "outline"}>
                      {isCurrent ? "Continue" : "Start"}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        
        {nextStep && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Next: {nextStep.title}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {nextStep.description}
                </p>
              </div>
              <Link href={nextStep.href}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Continue Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}