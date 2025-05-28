// import type { Config } from "tailwindcss";

// const config: Config = {
// 	darkMode: ["class"],
// 	content: [
// 		"./pages/**/*.{ts,tsx}",
// 		"./components/**/*.{ts,tsx}",
// 		"./app/**/*.{ts,tsx}",
// 		"./src/**/*.{ts,tsx}",
// 		"*.{js,ts,jsx,tsx,mdx}",
// 	],
// 	theme: {
// 		container: {
// 			center: true,
// 			padding: "2rem",
// 			screens: {
// 				"2xl": "1400px",
// 			},
// 		},
// 		extend: {
// 			colors: {
// 				"border": "hsl(var(--border))",
// 				"input": "hsl(var(--input))",
// 				"ring": "hsl(var(--ring))",
// 				"background": "hsl(var(--background))",
// 				"foreground": "hsl(var(--foreground))",
// 				"primary": {
// 					DEFAULT: "hsl(var(--primary))",
// 					foreground: "hsl(var(--primary-foreground))",
// 				},
// 				"secondary": {
// 					DEFAULT: "hsl(var(--secondary))",
// 					foreground: "hsl(var(--secondary-foreground))",
// 				},
// 				"destructive": {
// 					DEFAULT: "hsl(var(--destructive))",
// 					foreground: "hsl(var(--destructive-foreground))",
// 				},
// 				"muted": {
// 					DEFAULT: "hsl(var(--muted))",
// 					foreground: "hsl(var(--muted-foreground))",
// 				},
// 				"accent": {
// 					DEFAULT: "hsl(var(--accent))",
// 					foreground: "hsl(var(--accent-foreground))",
// 				},
// 				"popover": {
// 					DEFAULT: "hsl(var(--popover))",
// 					foreground: "hsl(var(--popover-foreground))",
// 				},
// 				"card": {
// 					DEFAULT: "hsl(var(--card))",
// 					foreground: "hsl(var(--card-foreground))",
// 				},
// 				"app-primary": "hsl(var(--app-primary))",
// 				"app-secondary": "hsl(var(--app-secondary))",
// 			},
// 			borderRadius: {
// 				lg: "var(--radius)",
// 				md: "calc(var(--radius) - 2px)",
// 				sm: "calc(var(--radius) - 4px)",
// 			},
// 			keyframes: {
// 				"accordion-down": {
// 					from: { height: "0" },
// 					to: { height: "var(--radix-accordion-content-height)" },
// 				},
// 				"accordion-up": {
// 					from: { height: "var(--radix-accordion-content-height)" },
// 					to: { height: "0" },
// 				},
// 			},
// 			animation: {
// 				"accordion-down": "accordion-down 0.2s ease-out",
// 				"accordion-up": "accordion-up 0.2s ease-out",
// 			},
// 		},
// 	},
// 	plugins: [require("tailwindcss-animate")],
// };

// export default config;

import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				"border": "hsl(var(--border))",
				"input": "hsl(var(--input))",
				"ring": "hsl(var(--ring))",
				"background": "hsl(var(--background))",
				"foreground": "hsl(var(--foreground))",
				"primary": {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					50: "#faf5ff",
					100: "#f3e8ff",
					200: "#e9d5ff",
					300: "#d8b4fe",
					400: "#c084fc",
					500: "#a855f7",
					600: "#9333ea",
					700: "#7c3aed",
					800: "#6b21a8",
					900: "#581c87",
					950: "#3b0764",
				},
				"secondary": {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
					50: "#fffbeb",
					100: "#fef3c7",
					200: "#fde68a",
					300: "#fcd34d",
					400: "#fbbf24",
					500: "#f59e0b",
					600: "#d97706",
					700: "#b45309",
					800: "#92400e",
					900: "#78350f",
					950: "#451a03",
				},
				"destructive": {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				"muted": {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				"accent": {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				"popover": {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				"card": {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				"app-primary": "hsl(var(--app-primary))",
				"app-secondary": "hsl(var(--app-secondary))",
				// Enhanced gradient colors
				"gradient": {
					from: "#8b5cf6",
					via: "#a855f7",
					to: "#f59e0b",
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-primary": "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
				"gradient-secondary":
					"linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
				"gradient-success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
				"gradient-warning": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
				"gradient-danger": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
				"gradient-info": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
				"gradient-dark":
					"linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
				"gradient-light":
					"linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f1f5f9 100%)",
				"glass-gradient":
					"linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
				"glass-gradient-dark":
					"linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
				"sidebar-gradient":
					"linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
				"sidebar-gradient-dark":
					"linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
			},
			borderRadius: {
				"lg": "var(--radius)",
				"md": "calc(var(--radius) - 2px)",
				"sm": "calc(var(--radius) - 4px)",
				"xl": "1rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
			},
			boxShadow: {
				"glow": "0 0 20px rgba(139, 92, 246, 0.15)",
				"glow-lg": "0 0 30px rgba(139, 92, 246, 0.2)",
				"glow-xl": "0 0 40px rgba(139, 92, 246, 0.25)",
				"glow-primary": "0 0 20px rgba(139, 92, 246, 0.4)",
				"glow-secondary": "0 0 20px rgba(245, 158, 11, 0.4)",
				"glow-success": "0 0 20px rgba(16, 185, 129, 0.4)",
				"glow-warning": "0 0 20px rgba(245, 158, 11, 0.4)",
				"glow-danger": "0 0 20px rgba(239, 68, 68, 0.4)",
				"inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
				"glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
				"glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
				"elevated":
					"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				"elevated-dark":
					"0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
			},
			backdropBlur: {
				"xs": "2px",
				"3xl": "64px",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"gradient-shift": {
					"0%, 100%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
				},
				"float": {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
				"pulse-glow": {
					"0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" },
					"50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.8)" },
				},
				"shimmer": {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				"slide-in": {
					"0%": { transform: "translateX(-100%)", opacity: "0" },
					"100%": { transform: "translateX(0)", opacity: "1" },
				},
				"slide-up": {
					"0%": { transform: "translateY(100%)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				"fade-in": {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				"scale-in": {
					"0%": { transform: "scale(0.9)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
				"bounce-in": {
					"0%": { transform: "scale(0.3)", opacity: "0" },
					"50%": { transform: "scale(1.05)" },
					"70%": { transform: "scale(0.9)" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"gradient-shift": "gradient-shift 3s ease infinite",
				"float": "float 3s ease-in-out infinite",
				"pulse-glow": "pulse-glow 2s ease-in-out infinite",
				"shimmer": "shimmer 2s infinite",
				"slide-in": "slide-in 0.3s ease-out",
				"slide-up": "slide-up 0.3s ease-out",
				"fade-in": "fade-in 0.3s ease-out",
				"scale-in": "scale-in 0.3s ease-out",
				"bounce-in": "bounce-in 0.6s ease-out",
			},
			spacing: {
				"18": "4.5rem",
				"88": "22rem",
				"128": "32rem",
			},
			fontSize: {
				"2xs": ["0.625rem", { lineHeight: "0.75rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
				"7xl": ["4.5rem", { lineHeight: "1" }],
				"8xl": ["6rem", { lineHeight: "1" }],
				"9xl": ["8rem", { lineHeight: "1" }],
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
			letterSpacing: {
				tightest: "-0.075em",
				tighter: "-0.05em",
				tight: "-0.025em",
				normal: "0",
				wide: "0.025em",
				wider: "0.05em",
				widest: "0.1em",
			},
			lineHeight: {
				"3": ".75rem",
				"4": "1rem",
				"5": "1.25rem",
				"6": "1.5rem",
				"7": "1.75rem",
				"8": "2rem",
				"9": "2.25rem",
				"10": "2.5rem",
			},
			zIndex: {
				"60": "60",
				"70": "70",
				"80": "80",
				"90": "90",
				"100": "100",
			},
			transitionDuration: {
				"400": "400ms",
				"600": "600ms",
				"800": "800ms",
				"900": "900ms",
			},
			transitionTimingFunction: {
				"bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
				"smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		// Custom plugin for additional utilities
		({ addUtilities, theme }: any) => {
			const newUtilities = {
				".text-gradient": {
					"background":
						"linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #f59e0b 100%)",
					"backgroundSize": "200% 200%",
					"animation": "gradient-shift 3s ease infinite",
					"-webkit-background-clip": "text",
					"background-clip": "text",
					"-webkit-text-fill-color": "transparent",
					"fontWeight": "700",
					"letterSpacing": "-0.02em",
				},
				".glass-effect": {
					"background": "var(--gradient-glass)",
					"backdropFilter": "blur(20px) saturate(180%)",
					"-webkit-backdrop-filter": "blur(20px) saturate(180%)",
					"border": "1px solid rgba(255, 255, 255, 0.125)",
					"boxShadow":
						"0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
					"position": "relative",
					"overflow": "hidden",
				},
				".hover-lift": {
					"transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					"&:hover": {
						transform: "translateY(-8px) scale(1.02)",
						boxShadow:
							"0 20px 40px rgba(0, 0, 0, 0.1), 0 0 30px rgba(139, 92, 246, 0.2)",
					},
				},
				".gradient-border": {
					"position": "relative",
					"background": "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
					"borderRadius": "0.75rem",
					"padding": "1px",
					"&::before": {
						content: '""',
						position: "absolute",
						inset: "1px",
						background: "hsl(var(--background))",
						borderRadius: "inherit",
					},
				},
			};
			addUtilities(newUtilities);
		},
	],
};

export default config;
