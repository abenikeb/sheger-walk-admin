"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	trend?: {
		value: number;
		label: string;
		isPositive?: boolean;
	};
	variant?:
		| "default"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger";
	className?: string;
}

const variantStyles = {
	default: {
		card: "bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/30 border-slate-200/60 dark:border-slate-700/60 hover:from-slate-100 hover:to-slate-200/80 dark:hover:from-slate-800/60 dark:hover:to-slate-700/40",
		iconBg:
			"bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-slate-300/50 dark:border-slate-600/50",
		icon: "text-slate-600 dark:text-slate-300",
		value: "text-slate-900 dark:text-slate-100",
		glow: "shadow-slate-200/20 dark:shadow-slate-800/20",
	},
	primary: {
		card: "bg-gradient-to-br from-blue-50 via-purple-50/80 to-blue-100/60 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-blue-900/20 border-blue-200/60 dark:border-blue-800/40 hover:from-blue-100 hover:via-purple-100/80 hover:to-blue-200/60 dark:hover:from-blue-900/40 dark:hover:via-purple-900/30 dark:hover:to-blue-800/30",
		iconBg:
			"bg-gradient-to-br from-blue-500 to-purple-600 border-blue-300/50 dark:border-blue-600/50 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/10",
		icon: "text-white",
		value: "text-blue-700 dark:text-blue-300 font-bold",
		glow: "shadow-blue-200/30 dark:shadow-blue-900/20 hover:shadow-blue-300/40 dark:hover:shadow-blue-800/30",
	},
	secondary: {
		card: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-900/20 border-amber-200/60 dark:border-amber-800/40 hover:from-amber-100 hover:via-orange-100/80 hover:to-amber-200/60 dark:hover:from-amber-900/40 dark:hover:via-orange-900/30 dark:hover:to-amber-800/30",
		iconBg:
			"bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300/50 dark:border-amber-600/50 shadow-lg shadow-amber-500/20 dark:shadow-amber-400/10",
		icon: "text-white",
		value: "text-amber-700 dark:text-amber-300 font-bold",
		glow: "shadow-amber-200/30 dark:shadow-amber-900/20 hover:shadow-amber-300/40 dark:hover:shadow-amber-800/30",
	},
	success: {
		card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-100/60 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40 hover:from-emerald-100 hover:via-green-100/80 hover:to-emerald-200/60 dark:hover:from-emerald-900/40 dark:hover:via-green-900/30 dark:hover:to-emerald-800/30",
		iconBg:
			"bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300/50 dark:border-emerald-600/50 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-400/10",
		icon: "text-white",
		value: "text-emerald-700 dark:text-emerald-300 font-bold",
		glow: "shadow-emerald-200/30 dark:shadow-emerald-900/20 hover:shadow-emerald-300/40 dark:hover:shadow-emerald-800/30",
	},
	warning: {
		card: "bg-gradient-to-br from-yellow-50 via-amber-50/80 to-yellow-100/60 dark:from-yellow-950/30 dark:via-amber-950/20 dark:to-yellow-900/20 border-yellow-200/60 dark:border-yellow-800/40 hover:from-yellow-100 hover:via-amber-100/80 hover:to-yellow-200/60 dark:hover:from-yellow-900/40 dark:hover:via-amber-900/30 dark:hover:to-yellow-800/30",
		iconBg:
			"bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-300/50 dark:border-yellow-600/50 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-400/10",
		icon: "text-white",
		value: "text-yellow-700 dark:text-yellow-300 font-bold",
		glow: "shadow-yellow-200/30 dark:shadow-yellow-900/20 hover:shadow-yellow-300/40 dark:hover:shadow-yellow-800/30",
	},
	danger: {
		card: "bg-gradient-to-br from-red-50 via-rose-50/80 to-red-100/60 dark:from-red-950/30 dark:via-rose-950/20 dark:to-red-900/20 border-red-200/60 dark:border-red-800/40 hover:from-red-100 hover:via-rose-100/80 hover:to-red-200/60 dark:hover:from-red-900/40 dark:hover:via-rose-900/30 dark:hover:to-red-800/30",
		iconBg:
			"bg-gradient-to-br from-red-500 to-rose-600 border-red-300/50 dark:border-red-600/50 shadow-lg shadow-red-500/20 dark:shadow-red-400/10",
		icon: "text-white",
		value: "text-red-700 dark:text-red-300 font-bold",
		glow: "shadow-red-200/30 dark:shadow-red-900/20 hover:shadow-red-300/40 dark:hover:shadow-red-800/30",
	},
};

export function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	variant = "default",
	className,
}: StatCardProps) {
	const styles = variantStyles[variant];

	const formatValue = (val: string | number) => {
		if (typeof val === "number") {
			return new Intl.NumberFormat().format(val);
		}
		return val;
	};

	return (
		<Card
			className={cn(
				"relative overflow-hidden border-2 transition-all duration-300 ease-out",
				"hover:scale-[1.02] hover:-translate-y-1",
				styles.card,
				styles.glow,
				className
			)}>
			{/* Removed animated background overlay that was causing flickering */}

			<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="text-sm font-semibold text-muted-foreground/80 dark:text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/90 transition-colors">
					{title}
				</CardTitle>
				<div
					className={cn(
						"h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
						styles.iconBg
					)}>
					<Icon
						className={cn(
							"h-6 w-6 transition-transform duration-300",
							styles.icon
						)}
					/>
				</div>
			</CardHeader>

			<CardContent className="relative space-y-2">
				<div
					className={cn(
						"text-3xl font-bold tracking-tight transition-colors duration-200",
						styles.value
					)}>
					{formatValue(value)}
				</div>

				{subtitle && (
					<p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/80 transition-colors">
						{subtitle}
					</p>
				)}

				{trend && (
					<div className="flex items-center gap-2 pt-1">
						<div
							className={cn(
								"flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200",
								trend.isPositive !== false
									? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							)}>
							{trend.isPositive !== false ? (
								<TrendingUp className="h-3 w-3" />
							) : (
								<TrendingDown className="h-3 w-3" />
							)}
							<span>
								{trend.isPositive !== false ? "+" : ""}
								{trend.value}
							</span>
						</div>
						<span className="text-xs text-muted-foreground/60 dark:text-muted-foreground/70">
							{trend.label}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// "use client";

// import type { LucideIcon } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

// interface StatCardProps {
// 	title: string;
// 	value: string | number;
// 	subtitle?: string;
// 	icon: LucideIcon;
// 	trend?: {
// 		value: number;
// 		label: string;
// 		isPositive?: boolean;
// 	};
// 	variant?:
// 		| "default"
// 		| "primary"
// 		| "secondary"
// 		| "success"
// 		| "warning"
// 		| "danger";
// 	className?: string;
// }

// const variantStyles = {
// 	default: {
// 		card: "glass-effect border-white/20 hover:border-slate-300/30 dark:hover:border-slate-600/30",
// 		iconBg: "bg-gradient-to-br from-slate-500 to-slate-600 shadow-glow",
// 		icon: "text-white",
// 		value: "text-slate-900 dark:text-slate-100",
// 		glow: "shadow-glow hover:shadow-xl",
// 		accent: "from-slate-500/10 to-slate-600/10",
// 	},
// 	primary: {
// 		card: "glass-effect border-blue-200/30 dark:border-blue-800/30 hover:border-blue-300/50 dark:hover:border-blue-600/50",
// 		iconBg: "bg-gradient-to-br from-blue-500 to-purple-600 shadow-glow-primary",
// 		icon: "text-white",
// 		value: "text-blue-700 dark:text-blue-300 font-bold",
// 		glow: "shadow-glow-primary hover:shadow-xl",
// 		accent: "from-blue-500/10 to-purple-600/10",
// 	},
// 	secondary: {
// 		card: "glass-effect border-amber-200/30 dark:border-amber-800/30 hover:border-amber-300/50 dark:hover:border-amber-600/50",
// 		iconBg:
// 			"bg-gradient-to-br from-amber-500 to-orange-600 shadow-glow-secondary",
// 		icon: "text-white",
// 		value: "text-amber-700 dark:text-amber-300 font-bold",
// 		glow: "shadow-glow-secondary hover:shadow-xl",
// 		accent: "from-amber-500/10 to-orange-600/10",
// 	},
// 	success: {
// 		card: "glass-effect border-emerald-200/30 dark:border-emerald-800/30 hover:border-emerald-300/50 dark:hover:border-emerald-600/50",
// 		iconBg:
// 			"bg-gradient-to-br from-emerald-500 to-green-600 shadow-glow-success",
// 		icon: "text-white",
// 		value: "text-emerald-700 dark:text-emerald-300 font-bold",
// 		glow: "shadow-glow-success hover:shadow-xl",
// 		accent: "from-emerald-500/10 to-green-600/10",
// 	},
// 	warning: {
// 		card: "glass-effect border-yellow-200/30 dark:border-yellow-800/30 hover:border-yellow-300/50 dark:hover:border-yellow-600/50",
// 		iconBg:
// 			"bg-gradient-to-br from-yellow-500 to-amber-600 shadow-glow-warning",
// 		icon: "text-white",
// 		value: "text-yellow-700 dark:text-yellow-300 font-bold",
// 		glow: "shadow-glow-warning hover:shadow-xl",
// 		accent: "from-yellow-500/10 to-amber-600/10",
// 	},
// 	danger: {
// 		card: "glass-effect border-red-200/30 dark:border-red-800/30 hover:border-red-300/50 dark:hover:border-red-600/50",
// 		iconBg: "bg-gradient-to-br from-red-500 to-rose-600 shadow-glow-danger",
// 		icon: "text-white",
// 		value: "text-red-700 dark:text-red-300 font-bold",
// 		glow: "shadow-glow-danger hover:shadow-xl",
// 		accent: "from-red-500/10 to-rose-600/10",
// 	},
// };

// export function StatCard({
// 	title,
// 	value,
// 	subtitle,
// 	icon: Icon,
// 	trend,
// 	variant = "default",
// 	className,
// }: StatCardProps) {
// 	const styles = variantStyles[variant];

// 	const formatValue = (val: string | number) => {
// 		if (typeof val === "number") {
// 			return new Intl.NumberFormat().format(val);
// 		}
// 		return val;
// 	};

// 	return (
// 		<Card
// 			className={cn(
// 				"relative overflow-hidden transition-all duration-500 ease-out group hover-lift",
// 				styles.card,
// 				styles.glow,
// 				className
// 			)}>
// 			{/* Animated background overlay */}
// 			<div
// 				className={cn(
// 					"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
// 					styles.accent
// 				)}
// 			/>

// 			{/* Shimmer effect */}
// 			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
// 				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
// 			</div>

// 			{/* Floating particles effect */}
// 			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
// 				<Sparkles className="w-4 h-4 text-white/30 animate-float" />
// 			</div>

// 			<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 z-10">
// 				<CardTitle className="text-sm font-semibold text-muted-foreground/80 dark:text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/90 transition-colors duration-300">
// 					{title}
// 				</CardTitle>
// 				<div
// 					className={cn(
// 						"h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
// 						styles.iconBg
// 					)}>
// 					<Icon
// 						className={cn(
// 							"h-7 w-7 transition-all duration-500 group-hover:scale-110",
// 							styles.icon
// 						)}
// 					/>
// 				</div>
// 			</CardHeader>

// 			<CardContent className="relative space-y-3 z-10">
// 				<div
// 					className={cn(
// 						"text-4xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105",
// 						styles.value
// 					)}>
// 					{formatValue(value)}
// 				</div>

// 				{subtitle && (
// 					<p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/80 transition-colors duration-300 group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/90">
// 						{subtitle}
// 					</p>
// 				)}

// 				{trend && (
// 					<div className="flex items-center gap-3 pt-2">
// 						<div
// 							className={cn(
// 								"flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 group-hover:scale-105",
// 								"backdrop-blur-sm border",
// 								trend.isPositive !== false
// 									? "bg-emerald-100/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700/50"
// 									: "bg-red-100/80 text-red-700 border-red-200/50 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700/50"
// 							)}>
// 							{trend.isPositive !== false ? (
// 								<TrendingUp className="h-4 w-4" />
// 							) : (
// 								<TrendingDown className="h-4 w-4" />
// 							)}
// 							<span>
// 								{trend.isPositive !== false ? "+" : ""}
// 								{trend.value}%
// 							</span>
// 						</div>
// 						<span className="text-sm text-muted-foreground/60 dark:text-muted-foreground/70 transition-colors duration-300">
// 							{trend.label}
// 						</span>
// 					</div>
// 				)}

// 				{/* Progress indicator */}
// 				<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
// 			</CardContent>
// 		</Card>
// 	);
// }
