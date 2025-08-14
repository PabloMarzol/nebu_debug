import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, User, Shield, AlertTriangle } from "lucide-react";
import AuthNavbar from "@/components/auth/auth-navbar";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requires2FA) {
        setRequires2FA(true);
        setLoginError(null);
        toast({
          title: "2FA Required",
          description: "Please enter your two-factor authentication code.",
        });
      } else {
        toast({
          title: "Login successful!",
          description: "Welcome back to NebulaX.",
        });
        // Invalidate auth query to refresh user state
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Small delay to ensure query updates before navigation
        setTimeout(() => {
          navigate("/");
        }, 100);
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("2FA")) {
        setRequires2FA(true);
        form.setError("twoFactorCode", { message: "Invalid 2FA code" });
      } else if (error.message.includes("locked")) {
        setLoginError("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
      } else if (error.message.includes("verification")) {
        setLoginError("Please verify your email address before logging in.");
      } else {
        setLoginError(error.message || "Invalid email or password");
      }
    },
  });

  const onSubmit = (data: LoginForm) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  return (
    <>
      <AuthNavbar title="Sign In" />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 pt-20">
      {/* Crypto-themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-black"></div>
        <div className="absolute inset-0">
          {/* Floating crypto symbols */}
          <div className="absolute top-20 left-10 text-purple-500/10 text-6xl animate-pulse">₿</div>
          <div className="absolute top-40 right-20 text-blue-500/10 text-4xl animate-bounce">Ξ</div>
          <div className="absolute bottom-32 left-20 text-cyan-500/10 text-5xl animate-pulse">⟨⟩</div>
          <div className="absolute bottom-20 right-10 text-pink-500/10 text-3xl animate-bounce">◆</div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
            <Lock className="w-8 h-8 text-purple-300" />
          </div>
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your NebulaX account to continue trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        disabled={loginMutation.isPending}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-purple-400/50"
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-200">Password</FormLabel>
                      <Link href="/auth/forgot-password" className="text-sm text-purple-300 hover:text-purple-200 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field}
                        disabled={loginMutation.isPending}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-purple-400/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {requires2FA && (
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-200">
                        <Shield className="w-4 h-4 text-purple-300" />
                        Two-Factor Authentication Code
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123456" 
                          {...field}
                          disabled={loginMutation.isPending}
                          maxLength={6}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-purple-400/50 text-center text-lg tracking-widest"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                      <p className="text-xs text-gray-400">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-purple-500/25"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-cyan-300 hover:text-cyan-200 hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <Shield className="w-4 h-4 text-purple-300" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}