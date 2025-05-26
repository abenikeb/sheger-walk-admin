"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Eye,
	EyeOff,
	Lock,
	Mail,
	AlertCircle,
	CheckCircle,
	ArrowRight,
	Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
	const router = useRouter();
	const { login, isAuthenticated, loading: authLoading } = useAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated && !authLoading) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		// Basic validation
		if (!formData.email || !formData.password) {
			setError("Please fill in all fields");
			setLoading(false);
			return;
		}

		if (!isValidEmail(formData.email)) {
			setError("Please enter a valid email address");
			setLoading(false);
			return;
		}

		try {
			const result = await login(formData.email, formData.password);

			if (result.success) {
				setSuccess("Login successful! Redirecting...");
				setTimeout(() => {
					router.push("/dashboard");
				}, 1000);
			} else {
				setError(result.error || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (error) setError("");
	};

	// Show loading spinner while checking authentication
	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black">
				<div className="text-center">
					<div className="relative">
						<div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
						<Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
					</div>
					<p className="text-white/80 text-lg font-medium">Authenticating...</p>
				</div>
			</div>
		);
	}

	// Don't render login form if already authenticated
	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Background Image */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage: `url('/walking3.jpg?height=1080&width=1920')`,
				}}>
				<div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
			</div>

			{/* Animated Background Elements */}
			<div className="absolute inset-0">
				<div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			{/* Grid Pattern Overlay */}
			<div className="absolute inset-0 opacity-20">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
						backgroundSize: "50px 50px",
					}}></div>
			</div>

			<div className="relative z-10 min-h-screen flex">
				{/* Left Side - Branding */}
				<div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
					<div className="max-w-md">
						<div className="flex items-center space-x-3 mb-8">
							<div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
								<Sparkles className="h-6 w-6 text-white" />
							</div>
							<span className="text-2xl font-bold text-white">Sheger Walk</span>
						</div>

						<h1 className="text-5xl font-bold text-white mb-6 leading-tight">
							Welcome to the
							<span className="block bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
								Admin Portal
							</span>
						</h1>

						<p className="text-xl text-white/70 mb-8 leading-relaxed">
							Manage your Sheger Walk platform with powerful admin tools and
							real-time analytics.
						</p>

						<div className="space-y-4">
							<div className="flex items-center space-x-3 text-white/60">
								<div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
								<span>Advanced user management</span>
							</div>
							<div className="flex items-center space-x-3 text-white/60">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<span>Real-time analytics dashboard</span>
							</div>
							<div className="flex items-center space-x-3 text-white/60">
								<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
								<span>Secure access controls</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Login Form */}
				<div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
					<div className="w-full max-w-md">
						{/* Mobile Header */}
						<div className="lg:hidden text-center mb-8">
							<div className="flex items-center justify-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
									<Sparkles className="h-5 w-5 text-white" />
								</div>
								<span className="text-xl font-bold text-white">
									Sheger Walk
								</span>
							</div>
							<h2 className="text-3xl font-bold text-white mb-2">
								Welcome Back
							</h2>
							<p className="text-white/70">Sign in to your admin account</p>
						</div>

						{/* Login Card */}
						<Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
							<CardHeader className="space-y-1 pb-8">
								<CardTitle className="text-2xl font-bold text-white text-center">
									Admin Access
								</CardTitle>
								<CardDescription className="text-center text-white/70">
									Enter your credentials to continue
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-6">
								{/* Success Alert */}
								{success && (
									<Alert className="border-emerald-500/50 bg-emerald-500/20 backdrop-blur-sm">
										<CheckCircle className="h-4 w-4 text-emerald-400" />
										<AlertDescription className="text-emerald-100">
											{success}
										</AlertDescription>
									</Alert>
								)}

								{/* Error Alert */}
								{error && (
									<Alert className="border-red-500/50 bg-red-500/20 backdrop-blur-sm">
										<AlertCircle className="h-4 w-4 text-red-400" />
										<AlertDescription className="text-red-100">
											{error}
										</AlertDescription>
									</Alert>
								)}

								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Email Field */}
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="text-white/90 font-medium text-sm">
											Email Address
										</Label>
										<div className="relative group">
											<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-emerald-400 transition-colors duration-200" />
											<Input
												id="email"
												type="email"
												placeholder="admin@shegerwalk.com"
												value={formData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 rounded-xl"
												disabled={loading}
												required
											/>
										</div>
									</div>

									{/* Password Field */}
									<div className="space-y-2">
										<Label
											htmlFor="password"
											className="text-white/90 font-medium text-sm">
											Password
										</Label>
										<div className="relative group">
											<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-emerald-400 transition-colors duration-200" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												value={formData.password}
												onChange={(e) =>
													handleInputChange("password", e.target.value)
												}
												className="pl-12 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 rounded-xl"
												disabled={loading}
												required
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors duration-200"
												disabled={loading}>
												{showPassword ? (
													<EyeOff className="h-5 w-5" />
												) : (
													<Eye className="h-5 w-5" />
												)}
											</button>
										</div>
									</div>

									{/* Remember Me & Forgot Password */}
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<input
												id="remember-me"
												name="remember-me"
												type="checkbox"
												className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-white/30 rounded bg-white/10 backdrop-blur-sm"
											/>
											<label
												htmlFor="remember-me"
												className="ml-3 block text-sm text-white/80">
												Remember me
											</label>
										</div>
										<div className="text-sm">
											<Link
												href="/forgot-password"
												className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
												Forgot password?
											</Link>
										</div>
									</div>

									{/* Submit Button */}
									<Button
										type="submit"
										className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group"
										disabled={loading}>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
												Signing in...
											</>
										) : (
											<>
												Sign In to Dashboard
												<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
											</>
										)}
									</Button>
								</form>

								{/* Footer Links */}
								<div className="pt-6 text-center border-t border-white/10">
									<p className="text-sm text-white/60">
										Need admin access?{" "}
										<Link
											href="/contact"
											className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
											Contact Support
										</Link>
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Bottom Text */}
						<div className="mt-8 text-center">
							<p className="text-xs text-white/40">
								© 2025 Sheger Walk. Secure admin portal.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
