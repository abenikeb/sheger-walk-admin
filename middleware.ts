import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "./hooks/use-auth";

// List of routes that require authentication
const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/login"];

export function middleware(req: NextRequest) {
	// const token = req.cookies.get("auth-token")?.value; // Adjust based on your auth
	// const { user, isAuthenticated, loading } = useAuth();
	const token = req.cookies.get("auth-token")?.value;

	const { pathname } = req.nextUrl;
    const isAuthenticated = !!token;
	// Redirect root "/" based on auth
	if (pathname === "/") {
		return NextResponse.redirect(
			new URL(isAuthenticated ? "/dashboard" : "/login", req.url)
		);
	}

	// If accessing protected route without token
	if (
		protectedRoutes.some((route) => pathname.startsWith(route)) &&
		!isAuthenticated
	) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirectAfterLogin", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// If accessing login when already logged in
	if (publicRoutes.includes(pathname) && isAuthenticated) {
		const redirectUrl =
			req.nextUrl.searchParams.get("redirectAfterLogin") || "/dashboard";
		return NextResponse.redirect(new URL(redirectUrl, req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard/:path*", "/login"], // Add your protected routes
};
