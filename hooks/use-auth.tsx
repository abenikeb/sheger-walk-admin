"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config.json";
import Cookies from "js-cookie";

interface User {
	id: number;
	email: string;
	name: string;
	role: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	login: (
		email: string,
		password: string
	) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
	refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const isAuthenticated = !!user;

	// Check for existing token on mount
	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			// const token = localStorage.getItem("token");
			// if (!token) {
			// 	setLoading(false);
			// 	return;
			// }
			const token = Cookies.get("auth-token"); // ✅ read from cookie
			if (!token) {
			setLoading(false);
			return;
			}

			// Verify token with backend
			const response = await fetch(`${API_URL}/api/authAdmin/verify`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			} else {
				// Token is invalid, remove it
				localStorage.removeItem("token");
			}
		} catch (error) {
			console.error("Auth check error:", error);
			localStorage.removeItem("token");
		} finally {
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await fetch(`${API_URL}/api/authAdmin/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();
			console.log({
				"data__":data
			})

			if (response.ok) {
				// Store token
			    Cookies.set("auth-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywicGhvbmUiOiIwOTQyNzg0MzIyIiwiaWF0IjoxNzU1NzgwODQyLCJleHAiOjE3NTgzNzI4NDJ9.xFpIV4796swbGm8PwTlHuJ7e7zqwMiaH-mro6JaRDXY", {
					expires: 7,        // 7 days expiry
					secure: false,      // only sent over HTTPS
					sameSite: "Strict" // prevent CSRF
				});
				localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywicGhvbmUiOiIwOTQyNzg0MzIyIiwiaWF0IjoxNzU1NzgwODQyLCJleHAiOjE3NTgzNzI4NDJ9.xFpIV4796swbGm8PwTlHuJ7e7zqwMiaH-mro6JaRDXY");
				setUser(data.user);
				return { success: true };
			} else {
				return { success: false, error: data.message || "Login failed" };
			}
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: "Network error. Please try again." };
		}
	};

	const logout = () => {
		Cookies.remove("auth-token"); // ✅ clear cookie
        setUser(null);
		router.push("/login");
	};

	const refreshToken = async () => {
		try {
			const token = Cookies.get("auth-token"); // ✅ get from cookie
            if (!token) return false;
			// const token = localStorage.getItem("token");
			// if (!token) return false;

			const response = await fetch(`${API_URL}/api/authAdmin/refresh`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				Cookies.set("auth-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywicGhvbmUiOiIwOTQyNzg0MzIyIiwiaWF0IjoxNzU1NzgwODQyLCJleHAiOjE3NTgzNzI4NDJ9.xFpIV4796swbGm8PwTlHuJ7e7zqwMiaH-mro6JaRDXY", {
					expires: 7,        // 7 days
					secure: false,      // HTTPS only
					sameSite: "Strict" // prevent CSRF
				});
				// localStorage.setItem("token", data.token);
				setUser(data.user);
				return true;
			} else {
				logout();
				return false;
			}
		} catch (error) {
			console.error("Token refresh error:", error);
			logout();
			return false;
		}
	};

	const value = {
		user,
		isAuthenticated,
		loading,
		login,
		logout,
		refreshToken,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
