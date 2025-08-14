import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Shield, User, Lock } from "lucide-react";
import AuthNavbar from "@/components/auth/auth-navbar";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, 
      "Password must contain at least one letter, one number, and one special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...registerData } = data;
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
          credentials: "include",
        });
        
        const responseText = await response.text();
        
        // Try to parse as JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text:", responseText);
          throw new Error("Invalid server response format");
        }
        
        if (!response.ok) {
          throw new Error(responseData.message || "Registration failed");
        }
        
        return responseData;
      } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new Error("Network error - please check your connection");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful!",
        description: "Account created successfully. You are now logged in!",
      });
      // Invalidate auth query to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to trading dashboard
      setTimeout(() => {
        window.location.href = "/trading";
      }, 1000);
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      
      // Handle specific error types
      let errorMessage = error.message || "Please try again.";
      if (error.message && error.message.includes("Account already exists")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message && error.message.includes("Invalid server response")) {
        errorMessage = "Server error - please try again in a moment.";
      } else if (error.message && error.message.includes("Network error")) {
        errorMessage = "Network connection issue - please check your internet connection.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <>
        <AuthNavbar title="Registration Complete" />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 pt-20">
        {/* Success state background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-green-900/40 to-black"></div>
          <div className="absolute inset-0">
            {/* Success animation symbols */}
            <div className="absolute top-32 left-16 text-green-500/10 text-5xl animate-bounce">✓</div>
            <div className="absolute top-16 right-12 text-emerald-500/10 text-6xl animate-pulse">🚀</div>
            <div className="absolute bottom-40 left-12 text-teal-500/10 text-4xl animate-bounce">💎</div>
            <div className="absolute bottom-16 right-16 text-green-500/10 text-3xl animate-pulse">⭐</div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse"></div>
          </div>
        </div>
        
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <Mail className="w-8 h-8 text-green-300" />
            </div>
            <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a verification link to your email address. Please click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Didn't receive the email? Check your spam folder or wait a few minutes before requesting a new one.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-green-400/50">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <AuthNavbar title="Sign Up" />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 pt-20">
      {/* Crypto-themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-indigo-900/40 to-black"></div>
        <div className="absolute inset-0">
          {/* Floating crypto symbols */}
          <div className="absolute top-32 left-16 text-cyan-500/10 text-5xl animate-bounce">⟨⟩</div>
          <div className="absolute top-16 right-12 text-purple-500/10 text-6xl animate-pulse">₿</div>
          <div className="absolute bottom-40 left-12 text-pink-500/10 text-4xl animate-bounce">Ξ</div>
          <div className="absolute bottom-16 right-16 text-blue-500/10 text-3xl animate-pulse">◆</div>
          <div className="absolute top-1/2 left-8 text-green-500/10 text-4xl animate-bounce">$</div>
          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse"></div>
        </div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
            <User className="w-8 h-8 text-cyan-300" />
          </div>
          <CardTitle className="text-2xl text-white">Create Your Account</CardTitle>
          <CardDescription className="text-gray-300">
            Join NebulaX and start trading cryptocurrencies securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-cyan-400/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          {...field} 
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-cyan-400/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="user@nebulaxexchange.io" 
                        {...field} 
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-cyan-400/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-cyan-400/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-cyan-400/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />



              <div className="text-center mb-4">
                <p className="text-xs text-gray-400">
                  By creating an account, I agree to the{" "}
                  <Link href="/terms" className="text-purple-300 hover:text-purple-200 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-purple-300 hover:text-purple-200 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-cyan-500/25"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-300 hover:text-purple-200 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <Shield className="w-4 h-4 text-cyan-300" />
              <span>Join thousands of traders on NebulaX Exchange</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}