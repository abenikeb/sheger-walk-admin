"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	color?: "blue" | "green" | "purple" | "amber" | "red" | "indigo";
	className?: string;
}

const colorStyles = {
	blue: {
		card: "bg-gradient-to-br from-blue-50 via-sky-50/80 to-blue-100/60 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-blue-900/30 border-2 border-blue-200/60 dark:border-blue-800/50 hover:from-blue-100 hover:via-sky-100/80 hover:to-blue-200/60 dark:hover:from-blue-900/50 dark:hover:via-sky-900/40 dark:hover:to-blue-800/40",
		iconBg:
			"bg-gradient-to-br from-blue-500 to-sky-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/15",
		icon: "text-white",
		value: "text-blue-700 dark:text-blue-300",
		title: "text-blue-800/80 dark:text-blue-200/90",
		glow: "shadow-blue-200/25 dark:shadow-blue-900/20 hover:shadow-blue-300/35 dark:hover:shadow-blue-800/25",
	},
	green: {
		card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-100/60 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/30 border-2 border-emerald-200/60 dark:border-emerald-800/50 hover:from-emerald-100 hover:via-green-100/80 hover:to-emerald-200/60 dark:hover:from-emerald-900/50 dark:hover:via-green-900/40 dark:hover:to-emerald-800/40",
		iconBg:
			"bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-400/15",
		icon: "text-white",
		value: "text-emerald-700 dark:text-emerald-300",
		title: "text-emerald-800/80 dark:text-emerald-200/90",
		glow: "shadow-emerald-200/25 dark:shadow-emerald-900/20 hover:shadow-emerald-300/35 dark:hover:shadow-emerald-800/25",
	},
	purple: {
		card: "bg-gradient-to-br from-purple-50 via-violet-50/80 to-purple-100/60 dark:from-purple-950/40 dark:via-violet-950/30 dark:to-purple-900/30 border-2 border-purple-200/60 dark:border-purple-800/50 hover:from-purple-100 hover:via-violet-100/80 hover:to-purple-200/60 dark:hover:from-purple-900/50 dark:hover:via-violet-900/40 dark:hover:to-purple-800/40",
		iconBg:
			"bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25 dark:shadow-purple-400/15",
		icon: "text-white",
		value: "text-purple-700 dark:text-purple-300",
		title: "text-purple-800/80 dark:text-purple-200/90",
		glow: "shadow-purple-200/25 dark:shadow-purple-900/20 hover:shadow-purple-300/35 dark:hover:shadow-purple-800/25",
	},
	amber: {
		card: "bg-gradient-to-br from-amber-50 via-yellow-50/80 to-amber-100/60 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-900/30 border-2 border-amber-200/60 dark:border-amber-800/50 hover:from-amber-100 hover:via-yellow-100/80 hover:to-amber-200/60 dark:hover:from-amber-900/50 dark:hover:via-yellow-900/40 dark:hover:to-amber-800/40",
		iconBg:
			"bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/25 dark:shadow-amber-400/15",
		icon: "text-white",
		value: "text-amber-700 dark:text-amber-300",
		title: "text-amber-800/80 dark:text-amber-200/90",
		glow: "shadow-amber-200/25 dark:shadow-amber-900/20 hover:shadow-amber-300/35 dark:hover:shadow-amber-800/25",
	},
	red: {
		card: "bg-gradient-to-br from-red-50 via-rose-50/80 to-red-100/60 dark:from-red-950/40 dark:via-rose-950/30 dark:to-red-900/30 border-2 border-red-200/60 dark:border-red-800/50 hover:from-red-100 hover:via-rose-100/80 hover:to-red-200/60 dark:hover:from-red-900/50 dark:hover:via-rose-900/40 dark:hover:to-red-800/40",
		iconBg:
			"bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 dark:shadow-red-400/15",
		icon: "text-white",
		value: "text-red-700 dark:text-red-300",
		title: "text-red-800/80 dark:text-red-200/90",
		glow: "shadow-red-200/25 dark:shadow-red-900/20 hover:shadow-red-300/35 dark:hover:shadow-red-800/25",
	},
	indigo: {
		card: "bg-gradient-to-br from-indigo-50 via-blue-50/80 to-indigo-100/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-indigo-900/30 border-2 border-indigo-200/60 dark:border-indigo-800/50 hover:from-indigo-100 hover:via-blue-100/80 hover:to-indigo-200/60 dark:hover:from-indigo-900/50 dark:hover:via-blue-900/40 dark:hover:to-indigo-800/40",
		iconBg:
			"bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-400/15",
		icon: "text-white",
		value: "text-indigo-700 dark:text-indigo-300",
		title: "text-indigo-800/80 dark:text-indigo-200/90",
		glow: "shadow-indigo-200/25 dark:shadow-indigo-900/20 hover:shadow-indigo-300/35 dark:hover:shadow-indigo-800/25",
	},
};

export function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	color = "blue",
	className,
}: MetricCardProps) {
	const styles = colorStyles[color];

	const formatValue = (val: string | number) => {
		if (typeof val === "number") {
			return new Intl.NumberFormat().format(val);
		}
		return val;
	};

	return (
		<Card
			className={cn(
				"overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1",
				styles.card,
				styles.glow,
				className
			)}>
			{/* Removed animated background overlay that was causing flickering */}

			<CardContent className="relative p-6">
				<div className="flex items-center space-x-4">
					<div className="flex-shrink-0">
						<div
							className={cn(
								"h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/20",
								styles.iconBg
							)}>
							<Icon
								className={cn(
									"h-7 w-7 transition-transform duration-300",
									styles.icon
								)}
							/>
						</div>
					</div>
					<div className="flex-1 min-w-0 space-y-1">
						<p
							className={cn(
								"text-sm font-semibold transition-colors duration-200",
								styles.title
							)}>
							{title}
						</p>
						<p
							className={cn(
								"text-2xl font-bold tracking-tight transition-colors duration-200",
								styles.value
							)}>
							{formatValue(value)}
						</p>
						{subtitle && (
							<p
								className={cn(
									"text-xs transition-colors duration-200",
									styles.title,
									"opacity-70"
								)}>
								{subtitle}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
