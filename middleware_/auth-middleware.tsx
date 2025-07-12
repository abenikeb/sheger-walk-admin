"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthMiddlewareProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	requireRole?: string[];
	redirectTo?: string;
}

export function AuthMiddleware({
	children,
	requireAuth = true,
	requireRole = [],
	redirectTo = "/login",
}: AuthMiddlewareProps) {
	const { user, isAuthenticated, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const isRoot = pathname === "/";
		const isLogin = pathname === "/login";
		const isDashboard = pathname.startsWith("/dashboard");

		// ✅ Handle root path "/"
		if (isRoot) {
			if (!isAuthenticated) {
				router.replace("/login");
			} else {
				router.replace("/dashboard");
			}
			return;
		}

		// ✅ If not authenticated and accessing dashboard
		if (!isAuthenticated && isDashboard) {
			router.replace("/login");
			return;
		}

		// ✅ Prevent login route when already authenticated
		if (isAuthenticated && isLogin) {
			const redirectUrl =
				localStorage.getItem("redirectAfterLogin") || "/dashboard";
			localStorage.removeItem("redirectAfterLogin");
			router.replace(redirectUrl);
			return;
		}

		// ✅ Auth-required route
		if (requireAuth && !isAuthenticated) {
			localStorage.setItem("redirectAfterLogin", pathname);
			router.replace(redirectTo);
			return;
		}

		// ✅ Role check
		if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
			router.replace("/unauthorized");
			return;
		}

		// If user is authenticated and trying to access login page, redirect to dashboard
		// if (isAuthenticated && pathname === "/login") {
		// 	const redirectUrl =
		// 		localStorage.getItem("redirectAfterLogin") || "/dashboard";
		// 	localStorage.removeItem("redirectAfterLogin");
		// 	router.push(redirectUrl);
		// 	return;
		// }
	}, [
		isAuthenticated,
		loading,
		user,
		pathname,
		router,
		requireAuth,
		requireRole,
		redirectTo,
	]);

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render children if auth requirements aren't met
	if (requireAuth && !isAuthenticated) {
		return null;
	}

	if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
		return null;
	}

	return <>{children}</>;
}
