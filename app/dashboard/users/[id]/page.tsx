"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	CreditCard,
	Edit,
	Footprints,
	Trophy,
	User,
	Users,
	Calendar,
	Phone,
	Mail,
	Ruler,
	Weight,
	Activity,
	Award,
	Clock,
	UserCheck,
	BadgeCheck,
	UserX,
	Share2,
	Wallet,
	ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

interface UserDetails {
	id: number;
	name: string;
	email: string;
	phone?: string;
	age?: number;
	height?: number;
	weight?: number;
	gender?: string;
	rank?: string;
	isProfileCompleted: boolean;
	createdAt: string;
	updatedAt: string;
	wallet: {
		id: number;
		balance: number;
	};
	roles: string[];
	activities: any[];
	challenges: any[];
	transactions: any[];
	leaderboardEntries: any[];
	withdrawRequests: any[];
	referrals?: any[]; // New field for referrals
	referredBy?: any; // New field for who referred this user
}

export default function UserDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id;

	const [user, setUser] = useState<UserDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("activities");

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`${API_URL}/api/admin/users/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${BEARER_TOKEN}`
						},
					}
				);
				const data = await response.json();

				console.log("User data:", data);

				if (data.user) {
					setUser(data.user);
				}
			} catch (error) {
				console.error("Error fetching user details:", error);
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchUserData();
		}
	}, [userId]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const getRankColor = (rank?: string) => {
		if (!rank) return "bg-gray-100 text-gray-800";

		switch (rank) {
			case "BEGINNER":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
			case "WALKER":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			case "ACTIVE_WALKER":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
			case "PRO_WALKER":
				return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
			case "MASTER_WALKER":
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
			case "ELITE_WALKER":
				return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
			case "Approved":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			case "Rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="mr-2">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">User Details</h1>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-app-primary border-t-transparent"></div>
						<p className="text-sm text-muted-foreground">
							Loading user details...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="mr-2">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">User Details</h1>
				</div>
				<Card className="border-2 border-border/50 shadow-md">
					<CardContent className="flex items-center justify-center h-64">
						<div className="flex flex-col items-center gap-2 text-center">
							<UserX className="h-12 w-12 text-muted-foreground/50" />
							<p className="text-muted-foreground font-medium">
								User not found
							</p>
							<p className="text-sm text-muted-foreground/70">
								The requested user profile could not be found
							</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => router.push("/dashboard/users")}>
								Back to Users
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 animate-fadeIn">
			{/* Header with user info */}
			<div className="relative overflow-hidden rounded-xl border-2 border-border/50 bg-gradient-to-r from-app-primary/5 via-background to-app-secondary/5 p-6 shadow-md">
				<div className="absolute inset-0 bg-grid-pattern opacity-[0.015]"></div>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="mr-2 bg-background/80 backdrop-blur-sm hover:bg-background/90">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<Avatar className="h-16 w-16 border-2 border-background shadow-md">
							<AvatarFallback className="bg-gradient-to-br from-app-primary to-app-secondary text-white text-xl">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-3xl font-bold tracking-tight">
									{user.name}
								</h1>
								{user.isProfileCompleted && (
									<BadgeCheck className="h-5 w-5 text-app-primary" />
								)}
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Mail className="h-4 w-4" />
								<p>{user.email}</p>
							</div>
							<div className="flex items-center gap-2 mt-1">
								{user.rank && (
									<Badge
										variant="outline"
										className={`${getRankColor(user.rank)}`}>
										{user.rank.replace("_", " ")}
									</Badge>
								)}
								<Badge
									variant="outline"
									className={
										user.isProfileCompleted
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
											: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
									}>
									{user.isProfileCompleted
										? "Profile Complete"
										: "Profile Incomplete"}
								</Badge>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 mt-4 md:mt-0">
						<Button
							className="bg-app-primary hover:bg-app-primary/90 shadow-md shadow-app-primary/20 transition-all hover:shadow-lg hover:shadow-app-primary/30"
							asChild>
							<Link href={`/dashboard/users/${user.id}/edit`}>
								<Edit className="mr-2 h-4 w-4" />
								Edit User
							</Link>
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-7">
				{/* Profile Information Card */}
				<Card className="md:col-span-3 border-2 border-border/50 shadow-md hover:shadow-lg transition-all">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-xl flex items-center gap-2">
								<User className="h-5 w-5 text-app-primary" />
								Profile Information
							</CardTitle>
							<Badge
								variant="outline"
								className={
									user.isProfileCompleted
										? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
										: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
								}>
								{user.isProfileCompleted ? "Complete" : "Incomplete"}
							</Badge>
						</div>
						<CardDescription>
							{user?.isProfileCompleted
								? "Physical and profile details"
								: "Profile completion required"}
						</CardDescription>
						<Separator className="mt-2" />
					</CardHeader>
					<CardContent>
						{!user?.isProfileCompleted ? (
							<div className="space-y-4">
								<div className="grid gap-3">
									<div className="flex items-center py-2 border-b border-border/30">
										<div className="w-10 flex-shrink-0">
											<User className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="flex-grow">
											<span className="text-sm font-medium">Name</span>
										</div>
										<div className="flex-shrink-0">
											<span className="text-sm">{user.name}</span>
										</div>
									</div>
									<div className="flex items-center py-2 border-b border-border/30">
										<div className="w-10 flex-shrink-0">
											<Mail className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="flex-grow">
											<span className="text-sm font-medium">Email</span>
										</div>
										<div className="flex-shrink-0">
											<span className="text-sm">{user.email}</span>
										</div>
									</div>
									<div className="flex items-center py-2 border-b border-border/30">
										<div className="w-10 flex-shrink-0">
											<Phone className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="flex-grow">
											<span className="text-sm font-medium">Phone</span>
										</div>
										<div className="flex-shrink-0">
											<span className="text-sm">
												{user.phone || "Not provided"}
											</span>
										</div>
									</div>
								</div>
								<div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg shadow-sm">
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0">
											<UserX className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
										</div>
										<div className="flex-1">
											<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
												Profile Incomplete
											</h3>
											<p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
												This user hasn't completed their profile. Additional
												information like age, height, weight, and gender is
												missing.
											</p>
											<div className="mt-3">
												<Button
													size="sm"
													variant="outline"
													className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800/50 dark:text-yellow-500 dark:hover:bg-yellow-900/20"
													onClick={() => {
														// Add notification logic here
														console.log(
															"Send notification to complete profile"
														);
													}}>
													Send Completion Reminder
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
												<Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Phone</p>
												<p className="font-medium">
													{user.phone || "Not provided"}
												</p>
											</div>
										</div>
									</div>

									<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
												<Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Age</p>
												<p className="font-medium">
													{user.age || "Not provided"}
												</p>
											</div>
										</div>
									</div>

									<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
												<Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Height</p>
												<p className="font-medium">
													{user.height ? `${user.height} cm` : "Not provided"}
												</p>
											</div>
										</div>
									</div>

									<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
												<Weight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Weight</p>
												<p className="font-medium">
													{user.weight ? `${user.weight} kg` : "Not provided"}
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-app-primary/5 to-app-secondary/5 border border-border/50 shadow-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-app-primary/20 flex items-center justify-center">
												<Award className="h-5 w-5 text-app-primary" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">
													Current Rank
												</p>
												<div className="flex items-center gap-2">
													<p className="font-medium">
														{user.rank
															? user.rank.replace("_", " ")
															: "Not ranked"}
													</p>
													{user.rank && (
														<Badge
															variant="outline"
															className={getRankColor(user.rank)}>
															{user.rank.replace("_", " ")}
														</Badge>
													)}
												</div>
											</div>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Gender</p>
											<p className="font-medium text-right">
												{user.gender || "Not provided"}
											</p>
										</div>
									</div>
								</div>

								<div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30 shadow-sm">
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											<UserCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
										</div>
										<div className="flex-1">
											<h3 className="text-sm font-medium text-green-800 dark:text-green-500">
												Complete Profile
											</h3>
											<p className="text-sm text-green-700 dark:text-green-400 mt-1">
												This user has completed their profile with all required
												information.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* User Activity Card */}
				<Card className="md:col-span-4 border-2 border-border/50 shadow-md hover:shadow-lg transition-all">
					<Tabs
						defaultValue="activities"
						value={activeTab}
						onValueChange={setActiveTab}
						className="tabs-fix">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl flex items-center gap-2">
									<Activity className="h-5 w-5 text-app-primary" />
									User Activity
								</CardTitle>
								<TabsList className="bg-muted/50 p-1">
									<TabsTrigger
										value="activities"
										className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-background">
										Activities
									</TabsTrigger>
									<TabsTrigger
										value="challenges"
										className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-background">
										Challenges
									</TabsTrigger>
									<TabsTrigger
										value="transactions"
										className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-background">
										Transactions
									</TabsTrigger>
									<TabsTrigger
										value="leaderboard"
										className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-background">
										Leaderboard
									</TabsTrigger>
								</TabsList>
							</div>
							<CardDescription>
								View user activities, challenges, and transactions
							</CardDescription>
							<Separator className="mt-2" />
						</CardHeader>
						<CardContent className="tabs-content-fix">
							<TabsContent
								value="activities"
								className="space-y-4 animate-fadeIn">
								<div className="rounded-lg border border-border/50 overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50 hover:bg-muted/50">
												<TableHead className="font-medium">Date</TableHead>
												<TableHead className="font-medium">Steps</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{user.activities.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={2}
														className="text-center h-24 text-muted-foreground">
														<div className="flex flex-col items-center gap-2">
															<Footprints className="h-8 w-8 text-muted-foreground/50" />
															<p>No activities found.</p>
														</div>
													</TableCell>
												</TableRow>
											) : (
												user.activities.map((activity) => (
													<TableRow
														key={activity.id}
														className="hover:bg-muted/30">
														<TableCell>{formatDate(activity.date)}</TableCell>
														<TableCell>
															<div className="flex items-center">
																<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
																	<Footprints className="h-4 w-4 text-blue-600 dark:text-blue-400" />
																</div>
																<span className="font-medium">
																	{activity.steps}
																</span>
															</div>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</TabsContent>
							<TabsContent
								value="challenges"
								className="space-y-4 animate-fadeIn">
								<div className="rounded-lg border border-border/50 overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50 hover:bg-muted/50">
												<TableHead className="font-medium">Challenge</TableHead>
												<TableHead className="font-medium">Joined</TableHead>
												<TableHead className="font-medium">Progress</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{user.challenges.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={3}
														className="text-center h-24 text-muted-foreground">
														<div className="flex flex-col items-center gap-2">
															<Trophy className="h-8 w-8 text-muted-foreground/50" />
															<p>No challenges found.</p>
														</div>
													</TableCell>
												</TableRow>
											) : (
												user.challenges.map((challenge) => (
													<TableRow
														key={challenge.id}
														className="hover:bg-muted/30">
														<TableCell>
															<div className="flex items-center">
																<div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
																	<Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
																</div>
																<span className="font-medium">
																	{challenge.challenge.name}
																</span>
															</div>
														</TableCell>
														<TableCell>{formatDate(challenge.date)}</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<div className="w-full max-w-24 h-2.5 bg-muted rounded-full overflow-hidden">
																	<div
																		className="h-full bg-gradient-to-r from-app-primary to-app-secondary rounded-full"
																		style={{
																			width: `${Math.round(
																				(challenge.steps /
																					challenge.challenge.stepsRequired) *
																					100
																			)}%`,
																		}}></div>
																</div>
																<span className="text-xs font-medium">
																	{Math.round(
																		(challenge.steps /
																			challenge.challenge.stepsRequired) *
																			100
																	)}
																	%
																</span>
															</div>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</TabsContent>
							<TabsContent
								value="transactions"
								className="space-y-4 animate-fadeIn">
								<div className="rounded-lg border border-border/50 overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50 hover:bg-muted/50">
												<TableHead className="font-medium">Date</TableHead>
												<TableHead className="font-medium">Type</TableHead>
												<TableHead className="font-medium">Amount</TableHead>
												<TableHead className="font-medium">
													Description
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{user.transactions.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={4}
														className="text-center h-24 text-muted-foreground">
														<div className="flex flex-col items-center gap-2">
															<CreditCard className="h-8 w-8 text-muted-foreground/50" />
															<p>No transactions found.</p>
														</div>
													</TableCell>
												</TableRow>
											) : (
												user.transactions.map((transaction) => (
													<TableRow
														key={transaction.id}
														className="hover:bg-muted/30">
														<TableCell>
															{formatDate(transaction.createdAt)}
														</TableCell>
														<TableCell>
															<div className="flex items-center">
																<div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
																	<CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
																</div>
																<span>{transaction.transactionType}</span>
															</div>
														</TableCell>
														<TableCell
															className={
																transaction.amount > 0
																	? "text-green-600 dark:text-green-400 font-medium"
																	: "text-red-600 dark:text-red-400 font-medium"
															}>
															{transaction.amount > 0 ? "+" : ""}
															{transaction.amount} {transaction.amountType}
														</TableCell>
														<TableCell>
															{transaction.description || "-"}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</TabsContent>
							<TabsContent
								value="leaderboard"
								className="space-y-4 animate-fadeIn">
								<div className="rounded-lg border border-border/50 overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50 hover:bg-muted/50">
												<TableHead className="font-medium">Date</TableHead>
												<TableHead className="font-medium">Rank</TableHead>
												<TableHead className="font-medium">Score</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{user.leaderboardEntries.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={3}
														className="text-center h-24 text-muted-foreground">
														<div className="flex flex-col items-center gap-2">
															<Award className="h-8 w-8 text-muted-foreground/50" />
															<p>No leaderboard entries found.</p>
														</div>
													</TableCell>
												</TableRow>
											) : (
												user.leaderboardEntries.map((entry) => (
													<TableRow
														key={entry.id}
														className="hover:bg-muted/30">
														<TableCell>{formatDate(entry.date)}</TableCell>
														<TableCell>
															<div className="flex items-center">
																<div className="h-8 w-8 rounded-full bg-app-secondary/20 flex items-center justify-center mr-2">
																	<Trophy className="h-4 w-4 text-app-secondary" />
																</div>
																<span className="font-medium">
																	#{entry.rank}
																</span>
															</div>
														</TableCell>
														<TableCell className="font-medium">
															{entry?.score}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</TabsContent>
						</CardContent>
						<CardFooter className="pt-0">
							<Button
								variant="outline"
								className="w-full group border-app-primary/20 text-app-primary hover:bg-app-primary/5 hover:text-app-primary hover:border-app-primary/30"
								asChild>
								<Link href={`/dashboard/users/${user.id}/activity`}>
									<span>View All Activity</span>
									<ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-[-2px]" />
								</Link>
							</Button>
						</CardFooter>
					</Tabs>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Wallet Balance Card */}
				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="pb-3">
						<CardTitle className="text-xl flex items-center gap-2">
							<Wallet className="h-5 w-5 text-app-primary" />
							Wallet Balance
						</CardTitle>
						<CardDescription>
							Current wallet balance and information
						</CardDescription>
						<Separator className="mt-2" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="p-6 rounded-lg bg-gradient-to-br from-app-primary/10 via-app-primary/5 to-app-secondary/10 dark:from-app-primary/5 dark:via-app-primary/2 dark:to-app-secondary/5 border border-app-primary/20 dark:border-app-primary/10 shadow-md relative overflow-hidden">
								<div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
								<div className="relative z-10">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Current Balance
											</p>
											<p className="text-3xl font-bold bg-gradient-to-r from-app-primary to-app-secondary bg-clip-text text-transparent">
												{user.wallet.balance.toLocaleString()} ETB
											</p>
										</div>
										<div className="h-16 w-16 bg-gradient-to-br from-app-primary to-app-secondary rounded-full flex items-center justify-center shadow-lg shadow-app-primary/20">
											<CreditCard className="h-8 w-8 text-white" />
										</div>
									</div>

									<div className="mt-4 pt-4 border-t border-app-primary/10 dark:border-app-primary/5">
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												Wallet ID
											</span>
											<span className="text-sm font-mono bg-app-primary/10 dark:bg-app-primary/20 px-2 py-1 rounded">
												{user.wallet.id}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
									<div className="flex flex-col gap-1">
										<p className="text-xs text-muted-foreground">
											Last Updated
										</p>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<p className="font-medium">
												{formatDate(user.updatedAt)}
											</p>
										</div>
									</div>
								</div>

								<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
									<div className="flex flex-col gap-1">
										<p className="text-xs text-muted-foreground">
											Account Created
										</p>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<p className="font-medium">
												{formatDate(user.createdAt)}
											</p>
										</div>
									</div>
								</div>
							</div>

							<Button
								variant="outline"
								className="w-full group border-app-primary/20 text-app-primary hover:bg-app-primary/5 hover:text-app-primary hover:border-app-primary/30"
								asChild>
								<Link href={`/dashboard/users/${user.id}/transactions`}>
									<span>View Transaction History</span>
									<ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-[-2px]" />
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Referral Information Card */}
				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="pb-3">
						<CardTitle className="text-xl flex items-center gap-2">
							<Share2 className="h-5 w-5 text-app-primary" />
							Referral Information
						</CardTitle>
						<CardDescription>
							User referral activity and statistics
						</CardDescription>
						<Separator className="mt-2" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="p-6 rounded-lg bg-gradient-to-br from-green-50 via-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:via-green-950/10 dark:to-blue-950/10 border border-green-200 dark:border-green-800/30 shadow-md relative overflow-hidden">
								<div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
								<div className="relative z-10">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Users Referred
											</p>
											<p className="text-3xl font-bold text-green-600 dark:text-green-500">
												{user.referrals
													? user.referrals.filter(
															(r) => r.status === "COMPLETED"
													  ).length
													: 0}
											</p>
										</div>
										<div className="h-16 w-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
											<Users className="h-8 w-8 text-white" />
										</div>
									</div>
								</div>
							</div>

							{user.referredBy ? (
								<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
									<h3 className="text-sm font-medium mb-2 flex items-center gap-2">
										<User className="h-4 w-4 text-app-primary" />
										Referred By
									</h3>
									<div className="flex items-center p-3 bg-muted/30 rounded-md">
										<Avatar className="h-10 w-10 mr-3">
											<AvatarFallback className="bg-gradient-to-br from-app-primary to-app-secondary text-white">
												{getInitials(user.referredBy.referrer.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-medium">
												{user.referredBy.referrer.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{user.referredBy.referrer.email}
											</p>
										</div>
										<Button variant="outline" size="sm" asChild>
											<Link
												href={`/dashboard/users/${user.referredBy.referrer.id}`}>
												View User
											</Link>
										</Button>
									</div>
								</div>
							) : (
								<div className="p-4 rounded-lg bg-muted/30 border border-border/50">
									<div className="flex items-center gap-3">
										<UserX className="h-5 w-5 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">
											This user was not referred by anyone.
										</p>
									</div>
								</div>
							)}

							<div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm">
								<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
									<Activity className="h-4 w-4 text-app-primary" />
									Referral Statistics
								</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="p-3 rounded-md bg-muted/30 text-center">
										<p className="text-xs text-muted-foreground">Total</p>
										<p className="text-xl font-bold">
											{user.referrals ? user.referrals.length : 0}
										</p>
										<p className="text-xs text-muted-foreground">Invitations</p>
									</div>

									<div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-center">
										<p className="text-xs text-green-600 dark:text-green-400">
											Completed
										</p>
										<p className="text-xl font-bold text-green-600 dark:text-green-400">
											{user.referrals
												? user.referrals.filter((r) => r.status === "COMPLETED")
														.length
												: 0}
										</p>
										<p className="text-xs text-green-600 dark:text-green-400">
											Referrals
										</p>
									</div>

									<div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-center">
										<p className="text-xs text-yellow-600 dark:text-yellow-400">
											Pending
										</p>
										<p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
											{user.referrals
												? user.referrals.filter((r) => r.status === "PENDING")
														.length
												: 0}
										</p>
										<p className="text-xs text-yellow-600 dark:text-yellow-400">
											Invites
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Withdrawal Requests Card */}
			<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
				<CardHeader className="pb-3">
					<CardTitle className="text-xl flex items-center gap-2">
						<CreditCard className="h-5 w-5 text-app-primary" />
						Withdrawal Requests
					</CardTitle>
					<CardDescription>
						View and manage user withdrawal requests
					</CardDescription>
					<Separator className="mt-2" />
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-border/50 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50 hover:bg-muted/50">
									<TableHead className="font-medium">Date</TableHead>
									<TableHead className="font-medium">Amount</TableHead>
									<TableHead className="font-medium">Status</TableHead>
									<TableHead className="font-medium">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{user.withdrawRequests.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center h-24 text-muted-foreground">
											<div className="flex flex-col items-center gap-2">
												<CreditCard className="h-8 w-8 text-muted-foreground/50" />
												<p>No withdrawal requests found.</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									user.withdrawRequests.map((request) => (
										<TableRow key={request.id} className="hover:bg-muted/30">
											<TableCell>{formatDate(request.date)}</TableCell>
											<TableCell className="font-medium">
												{request.withdrawAmount.toLocaleString()} ETB
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={getStatusColor(request.status)}>
													{request.status}
												</Badge>
											</TableCell>
											<TableCell>
												<Button variant="outline" size="sm" asChild>
													<Link href={`/dashboard/withdrawals/${request.id}`}>
														View Details
													</Link>
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
