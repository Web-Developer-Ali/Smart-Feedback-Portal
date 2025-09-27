"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Mail, Lock, User, Building, Chrome, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await searchParams;

      // Show toast notifications based on URL params
      if (resolvedParams.error) {
        toast.error(resolvedParams.error as string);
      }
      if (resolvedParams.success) {
        toast.success(resolvedParams.success as string);
      }
    };
    getParams();
  }, [searchParams]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("fullName", formData.fullName);
    formDataObj.append("email", formData.email);
    formDataObj.append("companyName", formData.companyName);
    formDataObj.append("password", formData.password);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          companyName: formData.companyName,
          password: formData.password,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          result.message ||
            "Account created. Please check your email for the OTP."
        );
        router.push(`/otp-verification?email=${formData.email}`);
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      
    } catch (error) {
      console.error("Google signup error:", error);
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Head>
        <title>Agency Sign Up | Smart Feedback Portal</title>
        <meta
          name="description"
          content="Create your agency account on Smart Feedback Portal to start providing feedback services to clients. Sign up with email or Google."
        />
        <meta
          name="keywords"
          content="agency signup, feedback platform, client feedback, digital agency"
        />
        <meta
          property="og:title"
          content="Agency Sign Up | Smart Feedback Portal"
        />
        <meta
          property="og:description"
          content="Join as an agency to provide feedback services to clients"
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/signup" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Agency Account
            </h1>
            <p className="text-gray-600 mt-2">
              Join Smart Feedback Portal as an Agency
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center">
                Agency Sign Up
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Provide feedback services to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      className="pl-10 h-11"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={isLoading || isGoogleLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10 h-11"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={isLoading || isGoogleLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    &quot;Company Name&quot; (Optional)
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Your Company"
                      className="pl-10 h-11"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      disabled={isLoading || isGoogleLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10 h-11"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={isLoading || isGoogleLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
