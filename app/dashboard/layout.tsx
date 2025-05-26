"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Activity,
	Award,
	BarChart3,
	Building,
	CreditCard,
	Gift,
	LogOut,
	Menu,
	Settings,
	Trophy,
	Users,
	ChevronRight,
	LayoutDashboard,
} from "lucide-react";
import { AuthMiddleware } from "@/middleware/auth-middleware";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType;
	badge?: string;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const navSections: NavSection[] = [
	{
		title: "Overview",
		items: [
			{
				title: "Dashboard",
				href: "/dashboard",
				icon: LayoutDashboard,
			},
			{
				title: "Activities",
				href: "/dashboard/activities",
				icon: Activity,
				badge: "New",
			},
		],
	},
	{
		title: "Management",
		items: [
			{
				title: "Users",
				href: "/dashboard/users",
				icon: Users,
			},
			{
				title: "Challenges",
				href: "/dashboard/challenges",
				icon: Trophy,
			},
			{
				title: "Rewards",
				href: "/dashboard/rewards",
				icon: Gift,
			},
			{
				title: "Providers",
				href: "/dashboard/providers",
				icon: Building,
			},
			{
				title: "Laderboard",
				href: "/dashboard/laderboard",
				icon: Trophy,
			},
		],
	},
	{
		title: "Finance",
		items: [
			{
				title: "Transactions",
				href: "/dashboard/transactions",
				icon: CreditCard,
			},
			{
				title: "Withdrawals",
				href: "/dashboard/withdrawals",
				icon: BarChart3,
			},
		],
	},
	{
		title: "System",
		items: [
			{
				title: "Settings",
				href: "/dashboard/settings",
				icon: Settings,
			},
		],
	},
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000); // Update every minute

		return () => clearInterval(timer);
	}, []);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<AuthMiddleware requireAuth={true}>
			<div className="flex min-h-screen flex-col">
				<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="shrink-0 md:hidden">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-80 p-0 sm:max-w-none">
							<div className="flex h-full flex-col">
								<SheetHeader className="border-b p-4">
									<SheetTitle className="flex items-center gap-2 text-app-primary">
										<div className="h-8 w-8 rounded-full bg-gradient-to-b from-app-primary to-app-secondary flex items-center justify-center">
											<Award className="h-5 w-5 text-white" />
										</div>
										<span className="font-bold">Sheger Walk Admin</span>
									</SheetTitle>
								</SheetHeader>
								<div className="flex-1 overflow-auto py-2">
									<nav className="grid gap-1 px-2">
										{navSections.map((section, sectionIndex) => (
											<div key={sectionIndex} className="mb-3">
												<div className="px-3 mb-1">
													<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
														{section.title}
													</h3>
												</div>
												{section.items.map((item, itemIndex) => (
													<Link
														key={itemIndex}
														href={item.href}
														onClick={() => setOpen(false)}
														className={cn(
															"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
															pathname === item.href
																? "bg-app-secondary text-primary-foreground shadow-sm"
																: "text-muted-foreground hover:bg-muted hover:text-foreground"
														)}>
														<div className="flex items-center gap-3">
															<div
																className={cn(
																	"flex h-7 w-7 items-center justify-center rounded-md transition-colors",
																	pathname === item.href
																		? "bg-white/20 text-white"
																		: "bg-muted text-muted-foreground group-hover:text-foreground"
																)}>
																<item.icon className="h-4 w-4" />
															</div>
															{item.title}
														</div>
														<div className="flex items-center">
															{item.badge && (
																<Badge
																	variant="outline"
																	className="ml-auto mr-1 bg-app-primary/10 text-app-primary border-app-primary/20 text-xs">
																	{item.badge}
																</Badge>
															)}
															<ChevronRight
																className={cn(
																	"h-4 w-4 text-muted-foreground/50 transition-transform",
																	pathname === item.href
																		? "text-white/50 rotate-90"
																		: "group-hover:translate-x-0.5"
																)}
															/>
														</div>
													</Link>
												))}
											</div>
										))}
									</nav>
								</div>
								<div className="border-t p-4">
									<div className="rounded-lg bg-muted p-3">
										<div className="flex items-center gap-3">
											<Avatar className="h-10 w-10 border-2 border-background">
												<AvatarFallback className="bg-app-primary text-white">
													AU
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-sm font-medium">Admin User</p>
												<p className="text-xs text-muted-foreground">
													admin@sheger-walk.com
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</SheetContent>
					</Sheet>
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-b from-app-primary to-app-secondary flex items-center justify-center">
							<Award className="h-5 w-5 text-white" />
						</div>
						<span className="text-lg font-semibold tracking-tight text-app-primary">
							Sheger Walk Admin
						</span>
					</div>
					<div className="ml-auto flex items-center gap-4">
						<div className="hidden md:flex flex-col items-end">
							<span className="text-sm font-medium">
								{formatTime(currentTime)}
							</span>
							<span className="text-xs text-muted-foreground">
								{formatDate(currentTime)}
							</span>
						</div>
						<ThemeToggle />
						<Button variant="outline" size="icon" asChild>
							<Link href="/auth/logout">
								<LogOut className="h-5 w-5" />
								<span className="sr-only">Log out</span>
							</Link>
						</Button>
					</div>
				</header>
				<div className="flex flex-1">
					<aside className="hidden w-64 shrink-0 border-r md:block bg-background dark:bg-background/[0.03] dark:border-border/40">
						<div className="flex h-full flex-col">
							<div className="flex-1 overflow-auto py-4">
								<nav className="grid gap-1 px-2">
									{navSections.map((section, sectionIndex) => (
										<div key={sectionIndex} className="mb-6">
											<div className="px-3 mb-2">
												<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
													{section.title}
												</h3>
												<Separator className="mt-1 bg-muted" />
											</div>
											{section.items.map((item, itemIndex) => (
												<Link
													key={itemIndex}
													href={item.href}
													className={cn(
														"group relative flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
														pathname === item.href
															? "bg-app-secondary text-primary-foreground dark:bg-app-secondary/90"
															: "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/20"
													)}>
													<div className="flex items-center gap-3">
														<div
															className={cn(
																"flex h-7 w-7 items-center justify-center rounded-md transition-colors",
																pathname === item.href
																	? "bg-white/20 text-white"
																	: "bg-muted/70 text-muted-foreground group-hover:text-foreground dark:bg-muted/30"
															)}>
															<item.icon className="h-4 w-4" />
														</div>
														{item.title}
													</div>
													<div className="flex items-center">
														{item.badge && (
															<Badge
																variant="outline"
																className="ml-auto mr-1 bg-app-primary/10 text-app-primary border-app-primary/20 text-xs">
																{item.badge}
															</Badge>
														)}
														<ChevronRight
															className={cn(
																"h-4 w-4 text-muted-foreground/50 transition-transform",
																pathname === item.href
																	? "text-white/50 rotate-90"
																	: "group-hover:translate-x-0.5"
															)}
														/>
													</div>
													{pathname === item.href && (
														<div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-app-primary" />
													)}
												</Link>
											))}
										</div>
									))}
								</nav>
							</div>
							<div className="border-t p-4">
								<div className="rounded-lg bg-muted/50 dark:bg-muted/20 p-4 shadow-sm transition-colors">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10 border-2 border-background">
											<AvatarFallback className="bg-gradient-to-br from-app-primary to-app-secondary text-white">
												AU
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-medium">Admin User</p>
											<p className="text-xs text-muted-foreground">
												admin@sheger-walk.com
											</p>
										</div>
									</div>
									<Separator className="my-3" />
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>Last login</span>
										<span>{formatTime(currentTime)}</span>
									</div>
								</div>
							</div>
						</div>
					</aside>
					<main className="flex-1 overflow-auto p-4 md:p-6 animate-fadeIn">
						{children}
					</main>
				</div>
			</div>
		</AuthMiddleware>
	);
}
