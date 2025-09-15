import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/login"];

export function middleware(req: NextRequest) {
	const token = req.cookies.get("auth-token")?.value;
	const { pathname } = req.nextUrl;

	const isAuthenticated = !!token;

	if (pathname === "/") {
		return NextResponse.redirect(
			new URL(isAuthenticated ? "/dashboard" : "/login", req.url)
		);
	}

	//Block access to protected routes if not authenticated
	if (
		protectedRoutes.some((route) => pathname.startsWith(route)) &&
		!isAuthenticated
	) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirectAfterLogin", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Prevent access to login when already logged in
	if (publicRoutes.includes(pathname) && isAuthenticated) {
		const redirectUrl =
			req.nextUrl.searchParams.get("redirectAfterLogin") || "/dashboard";
		return NextResponse.redirect(new URL(redirectUrl, req.url));
	}

	// Allow request to proceed
	return NextResponse.next();
}

export const config = {
	// This controls what routes the middleware runs on
	matcher: ["/", "/dashboard/:path*", "/login", "/profile"],
};
