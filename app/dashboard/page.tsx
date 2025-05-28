"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Activity,
	CreditCard,
	Users,
	Trophy,
	ArrowUpRight,
	UserPlus,
	TrendingUp,
	Calendar,
	BarChart3,
	PieChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
	format,
	subDays,
	parseISO,
	isAfter,
	isBefore,
	startOfDay,
	endOfDay,
} from "date-fns";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart as RePieChart,
	Pie,
	Cell,
	LineChart as ReLineChart,
	Line,
	CartesianGrid,
} from "recharts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { WithdrawalOverview } from "@/components/dashboard/withdrawal-overview";

// Define the base API URL
const API_URL = "http://localhost:3001"; // Update this with your actual API URL

// Define the auth token - in a real app, this would come from a secure auth context
const AUTH_TOKEN =
	"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJhZG1pbjEyQGdtYWlsLmNvbSIsImlzUG9ydGFsVXNlciI6dHJ1ZSwiaWF0IjoxNzQ3NDY5MDkwLCJleHAiOjE3NTAwNjEwOTB9.ZNMZ1ymCn76MyGYalLbrxhpcbVYC-suGS34K9TCik2M";

interface SystemStats {
	users: {
		total: number;
		newLastWeek: number;
	};
	challenges: {
		total: number;
		active: number;
	};
	transactions: {
		count: number;
		totalAmount: number;
	};
	activities: {
		count: number;
		totalSteps: number;
		recentCount: number;
	};
	withdrawals: {
		pendingCount: number;
		pendingAmount: number;
	};
}

interface RankStats {
	rank: string;
	count: number;
	percentage: number;
}

interface User {
	id: number;
	name: string;
	email: string | null;
	phone: string;
	age: number | null;
	gender: string | null;
	rank: string | null;
	isProfileCompleted: boolean;
	createdAt: string;
	updatedAt: string;
	walletBalance: number;
	roles: string[];
}

interface Transaction {
	id: number;
	walletId: number;
	amount: number;
	amountType: string;
	transactionType: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	userId: number;
	user: {
		id: number;
		name: string;
		email: string | null;
	};
}

interface Challenge {
	id: number;
	name: string;
	joiningCost: number;
	startDate: string;
	endDate: string;
	expiryDate: string;
	description: string;
	stepsRequired: number;
	minParticipants: number;
	participants: number;
	participantsList: Array<{
		userId: number;
		userName: string;
		userEmail: string;
		steps: number;
		joinDate: string;
		progress: number;
	}>;
}

interface DateRange {
	from: Date | undefined;
	to: Date | undefined;
}

interface ChartData {
	userGrowthData: Array<{ date: string; users: number }>;
	transactionTypeData: Array<{ name: string; value: number }>;
	challengeCompletionData: Array<{ name: string; value: number }>;
	userDemographicsAge: Array<{ age: string; count: number }>;
	userDemographicsGender: Array<{ name: string; value: number }>;
	challengeParticipationData: Array<{ name: string; participants: number }>;
	transactionTrendsData: Array<{ date: string; amount: number; count: number }>;
	rankProgressData: Array<{ rank: string; avgSteps: number }>;
}

const COLORS = [
	"#8b5cf6",
	"#f59e0b",
	"#10b981",
	"#ef4444",
	"#3b82f6",
	"#f97316",
	"#8b5cf6",
];

export default function EnhancedDashboardPage() {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [rankStats, setRankStats] = useState<RankStats[]>([]);
	const [recentUsers, setRecentUsers] = useState<User[]>([]);
	const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
		[]
	);
	const [allUsers, setAllUsers] = useState<User[]>([]);
	const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
	const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
	const [loading, setLoading] = useState(true);
	const [analyticsLoading, setAnalyticsLoading] = useState(false);
	const [profileCompletionStats, setProfileCompletionStats] = useState({
		completed: 0,
		incomplete: 0,
		percentage: 0,
	});
	const [withdrawalStats, setWithdrawalStats] = useState({
		pending: 0,
		approved: 0,
		rejected: 0,
	});
	const [dateRange, setDateRange] = useState<DateRange>({
		from: subDays(new Date(), 30),
		to: new Date(),
	});
	const [dateFilterOption, setDateFilterOption] = useState("30days");
	const [chartData, setChartData] = useState<ChartData>({
		userGrowthData: [],
		transactionTypeData: [],
		challengeCompletionData: [],
		userDemographicsAge: [],
		userDemographicsGender: [],
		challengeParticipationData: [],
		transactionTrendsData: [],
		rankProgressData: [],
	});

	useEffect(() => {
		fetchDashboardData();
	}, []);

	useEffect(() => {
		if (
			allUsers.length > 0 ||
			allTransactions.length > 0 ||
			allChallenges.length > 0
		) {
			processAnalyticsData();
		}
	}, [dateRange, allUsers, allTransactions, allChallenges]);

	const handleDateFilterChange = (value: string) => {
		setDateFilterOption(value);
		const today = new Date();

		switch (value) {
			case "7days":
				setDateRange({ from: subDays(today, 7), to: today });
				break;
			case "30days":
				setDateRange({ from: subDays(today, 30), to: today });
				break;
			case "90days":
				setDateRange({ from: subDays(today, 90), to: today });
				break;
			case "thisYear":
				setDateRange({ from: new Date(today.getFullYear(), 0, 1), to: today });
				break;
			case "custom":
				// Keep the current custom range
				break;
		}
	};

	const handleCustomDateRangeChange = (range: DateRange) => {
		if (range.from && range.to) {
			setDateRange(range);
			setDateFilterOption("custom");
		}
	};

	const filterDataByDateRange = <
		T extends { createdAt?: string; startDate?: string; date?: string }
	>(
		data: T[],
		dateField: keyof T = "createdAt" as keyof T
	): T[] => {
		if (!dateRange.from || !dateRange.to) return data;

		const fromDate = startOfDay(dateRange.from);
		const toDate = endOfDay(dateRange.to);

		return data.filter((item) => {
			const itemDate = item[dateField] as string;
			if (!itemDate) return false;

			const date = parseISO(itemDate);
			return isAfter(date, fromDate) && isBefore(date, toDate);
		});
	};

	const processAnalyticsData = () => {
		setAnalyticsLoading(true);

		try {
			// Filter data by date range
			const filteredUsers = filterDataByDateRange(allUsers);
			const filteredTransactions = filterDataByDateRange(allTransactions);
			const filteredChallenges = filterDataByDateRange(
				allChallenges,
				"startDate"
			);

			// Process User Growth Data
			const userGrowthData = processUserGrowthData(filteredUsers);

			// Process Transaction Type Data
			const transactionTypeData =
				processTransactionTypeData(filteredTransactions);

			// Process Transaction Trends Data
			const transactionTrendsData =
				processTransactionTrendsData(filteredTransactions);

			// Process Challenge Data
			const challengeCompletionData =
				processChallengeCompletionData(allChallenges);
			const challengeParticipationData =
				processChallengeParticipationData(filteredChallenges);

			// Process User Demographics
			const userDemographicsAge = processUserDemographicsAge(allUsers);
			const userDemographicsGender = processUserDemographicsGender(allUsers);

			// Process Rank Progress Data
			const rankProgressData = processRankProgressData();

			setChartData({
				userGrowthData,
				transactionTypeData,
				challengeCompletionData,
				userDemographicsAge,
				userDemographicsGender,
				challengeParticipationData,
				transactionTrendsData,
				rankProgressData,
			});
		} catch (error) {
			console.error("Error processing analytics data:", error);
		} finally {
			setAnalyticsLoading(false);
		}
	};

	const processUserGrowthData = (users: User[]) => {
		const growthMap = new Map<string, number>();

		users.forEach((user) => {
			const date = format(parseISO(user.createdAt), "MMM dd");
			growthMap.set(date, (growthMap.get(date) || 0) + 1);
		});

		return Array.from(growthMap.entries())
			.map(([date, users]) => ({ date, users }))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(-30); // Show last 30 data points
	};

	const processTransactionTypeData = (transactions: Transaction[]) => {
		const typeMap = new Map<string, number>();

		transactions.forEach((transaction) => {
			const type = transaction.transactionType;
			typeMap.set(type, (typeMap.get(type) || 0) + 1);
		});

		return Array.from(typeMap.entries()).map(([name, value]) => ({
			name,
			value,
		}));
	};

	const processTransactionTrendsData = (transactions: Transaction[]) => {
		const trendsMap = new Map<string, { amount: number; count: number }>();

		transactions.forEach((transaction) => {
			const date = format(parseISO(transaction.createdAt), "MMM dd");
			const existing = trendsMap.get(date) || { amount: 0, count: 0 };
			trendsMap.set(date, {
				amount: existing.amount + Math.abs(transaction.amount),
				count: existing.count + 1,
			});
		});

		return Array.from(trendsMap.entries())
			.map(([date, data]) => ({ date, ...data }))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(-30); // Show last 30 data points
	};

	const processChallengeCompletionData = (challenges: Challenge[]) => {
		let completed = 0;
		let inProgress = 0;
		let notStarted = 0;

		const now = new Date();

		challenges.forEach((challenge) => {
			const endDate = parseISO(challenge.endDate);
			const startDate = parseISO(challenge.startDate);

			if (isAfter(now, endDate)) {
				completed++;
			} else if (isAfter(now, startDate)) {
				inProgress++;
			} else {
				notStarted++;
			}
		});

		return [
			{ name: "Completed", value: completed },
			{ name: "In Progress", value: inProgress },
			{ name: "Not Started", value: notStarted },
		];
	};

	const processChallengeParticipationData = (challenges: Challenge[]) => {
		return challenges
			.map((challenge) => ({
				name:
					challenge.name.length > 15
						? challenge.name.substring(0, 15) + "..."
						: challenge.name,
				participants: challenge.participants || 0,
			}))
			.slice(0, 10); // Show top 10 challenges
	};

	const processUserDemographicsAge = (users: User[]) => {
		const ageGroups = {
			"18-24": 0,
			"25-34": 0,
			"35-44": 0,
			"45-54": 0,
			"55+": 0,
			"Unknown": 0,
		};

		users.forEach((user) => {
			if (!user.age) {
				ageGroups["Unknown"]++;
				return;
			}

			if (user.age >= 18 && user.age <= 24) ageGroups["18-24"]++;
			else if (user.age >= 25 && user.age <= 34) ageGroups["25-34"]++;
			else if (user.age >= 35 && user.age <= 44) ageGroups["35-44"]++;
			else if (user.age >= 45 && user.age <= 54) ageGroups["45-54"]++;
			else if (user.age >= 55) ageGroups["55+"]++;
			else ageGroups["Unknown"]++;
		});

		return Object.entries(ageGroups).map(([age, count]) => ({ age, count }));
	};

	const processUserDemographicsGender = (users: User[]) => {
		const genderCounts = {
			MALE: 0,
			FEMALE: 0,
			Unknown: 0,
		};

		users.forEach((user) => {
			if (user.gender === "MALE") genderCounts.MALE++;
			else if (user.gender === "FEMALE") genderCounts.FEMALE++;
			else genderCounts.Unknown++;
		});

		return [
			{ name: "Male", value: genderCounts.MALE },
			{ name: "Female", value: genderCounts.FEMALE },
			{ name: "Unknown", value: genderCounts.Unknown },
		].filter((item) => item.value > 0);
	};

	const processRankProgressData = () => {
		// This would ideally come from walking activities data
		// For now, we'll use estimated values based on rank requirements
		return [
			{ rank: "BEGINNER", avgSteps: 2500 },
			{ rank: "WALKER", avgSteps: 5000 },
			{ rank: "ACTIVE_WALKER", avgSteps: 8000 },
			{ rank: "PRO_WALKER", avgSteps: 12000 },
			{ rank: "MASTER_WALKER", avgSteps: 18000 },
			{ rank: "ELITE_WALKER", avgSteps: 25000 },
		];
	};

	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			// Fetch system statistics
			const statsResponse = await fetch(`${API_URL}/api/admin/statistics`, {
				headers: {
					Authorization: AUTH_TOKEN,
				},
			});

			if (statsResponse.ok) {
				const statsData = await statsResponse.json();
				setStats(statsData.statistics);
			} else {
				console.error(
					"Failed to fetch statistics:",
					await statsResponse.text()
				);
				toast({
					title: "Error",
					description: "Failed to fetch system statistics",
					variant: "destructive",
				});
			}

			// Fetch rank statistics
			const rankResponse = await fetch(
				`${API_URL}/api/admin/statistics/ranks`,
				{
					headers: {
						Authorization: AUTH_TOKEN,
					},
				}
			);

			if (rankResponse.ok) {
				const rankData = await rankResponse.json();
				setRankStats(rankData.rankStatistics || []);
			} else {
				console.error(
					"Failed to fetch rank statistics:",
					await rankResponse.text()
				);
			}

			// Fetch all users for analytics
			const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
				headers: {
					Authorization: AUTH_TOKEN,
				},
			});

			if (usersResponse.ok) {
				const usersData = await usersResponse.json();
				setAllUsers(usersData.users || []);
				setRecentUsers(usersData.users?.slice(0, 5) || []);

				// Calculate profile completion stats
				if (usersData.users && usersData.users.length > 0) {
					const completed = usersData.users.filter(
						(user: User) => user.isProfileCompleted
					).length;
					const total = usersData.users.length;
					setProfileCompletionStats({
						completed,
						incomplete: total - completed,
						percentage: Math.round((completed / total) * 100),
					});
				}
			} else {
				console.error("Failed to fetch users:", await usersResponse.text());
			}

			// Fetch all transactions for analytics
			const transactionsResponse = await fetch(
				`${API_URL}/api/admin/transactions`,
				{
					headers: {
						Authorization: AUTH_TOKEN,
					},
				}
			);

			if (transactionsResponse.ok) {
				const transactionsData = await transactionsResponse.json();
				setAllTransactions(transactionsData.transactions || []);
				setRecentTransactions(transactionsData.transactions?.slice(0, 5) || []);
			} else {
				console.error(
					"Failed to fetch transactions:",
					await transactionsResponse.text()
				);
			}

			// Fetch all challenges for analytics
			const challengesResponse = await fetch(
				`${API_URL}/api/admin/challenges`,
				{
					headers: {
						Authorization: AUTH_TOKEN,
					},
				}
			);

			if (challengesResponse.ok) {
				const challengesData = await challengesResponse.json();
				setAllChallenges(challengesData.challenges || []);
			} else {
				console.error(
					"Failed to fetch challenges:",
					await challengesResponse.text()
				);
			}

			// Fetch withdrawal requests to calculate stats
			const withdrawalsResponse = await fetch(
				`${API_URL}/api/admin/withdrawals`,
				{
					headers: {
						Authorization: AUTH_TOKEN,
					},
				}
			);

			if (withdrawalsResponse.ok) {
				const withdrawalsData = await withdrawalsResponse.json();
				const pending =
					withdrawalsData.withdrawRequests?.filter(
						(w: any) => w.status === "Pending"
					).length || 0;
				const approved =
					withdrawalsData.withdrawRequests?.filter(
						(w: any) => w.status === "Approved"
					).length || 0;
				const rejected =
					withdrawalsData.withdrawRequests?.filter(
						(w: any) => w.status === "Rejected"
					).length || 0;

				setWithdrawalStats({
					pending,
					approved,
					rejected,
				});
			} else {
				console.error(
					"Failed to fetch withdrawals:",
					await withdrawalsResponse.text()
				);
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			toast({
				title: "Error",
				description: "Failed to fetch dashboard data. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	if (loading) {
		return (
			<div className="flex flex-col gap-6 animate-fadeIn">
				<div className="flex flex-col gap-2">
					<h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
					<p className="text-muted-foreground text-lg">
						Welcome to Promo Tech Admin
					</p>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-app-primary/20 border-t-app-primary shadow-glow-primary"></div>
							<div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-app-primary/10"></div>
						</div>
						<p className="text-sm text-muted-foreground font-medium">
							Loading dashboard...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 animate-fadeIn">
			{/* Enhanced Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="flex flex-col gap-3">
					<h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
					<p className="text-muted-foreground text-lg">
						Welcome to Promo Tech Admin
					</p>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-app-primary" />
							<span>Real-time Analytics</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							<span>Live Data</span>
						</div>
					</div>
				</div>

				{/* Enhanced Date Filter Controls */}
				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					<div className="flex items-center gap-2">
						<Select
							value={dateFilterOption}
							onValueChange={handleDateFilterChange}>
							<SelectTrigger className="w-[180px] glass-effect border-white/20 hover:border-app-primary/30 transition-all duration-300">
								<SelectValue placeholder="Select date range" />
							</SelectTrigger>
							<SelectContent className="glass-effect border-white/20">
								<SelectItem value="7days">Last 7 Days</SelectItem>
								<SelectItem value="30days">Last 30 Days</SelectItem>
								<SelectItem value="90days">Last 90 Days</SelectItem>
								<SelectItem value="thisYear">This Year</SelectItem>
								<SelectItem value="custom">Custom Range</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<DatePickerWithRange
						date={dateRange}
						setDate={handleCustomDateRangeChange as any}
						className={
							dateFilterOption === "custom"
								? "opacity-100 glass-effect border-white/20"
								: "opacity-50 pointer-events-none glass-effect border-white/10"
						}
					/>
				</div>
			</div>

			{/* Key Metrics Cards */}
			<DashboardStats
				stats={stats}
				profileCompletionStats={profileCompletionStats}
				loading={loading}
			/>

			{/* Enhanced Analytics Section */}
			<Card className="glass-effect border-white/20 shadow-glow overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-app-primary/5 via-transparent to-app-secondary/5 opacity-50" />
				<CardHeader className="relative z-10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-r from-app-primary to-app-secondary flex items-center justify-center shadow-glow-primary">
							<BarChart3 className="w-5 h-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-2xl font-bold">
								Analytics Dashboard
							</CardTitle>
							<CardDescription className="text-base">
								Key performance metrics and trends based on real-time data
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="relative z-10">
					{analyticsLoading && (
						<div className="flex items-center justify-center py-8">
							<div className="flex items-center gap-3">
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-app-primary/20 border-t-app-primary"></div>
								<span className="text-sm text-muted-foreground font-medium">
									Updating analytics...
								</span>
							</div>
						</div>
					)}

					<Tabs defaultValue="overview" className="space-y-6 tabs-fix">
						<TabsList className="grid grid-cols-4 md:w-[600px] glass-effect border-white/20">
							<TabsTrigger
								value="overview"
								className="data-[state=active]:bg-app-primary data-[state=active]:text-white">
								Overview
							</TabsTrigger>
							<TabsTrigger
								value="users"
								className="data-[state=active]:bg-app-primary data-[state=active]:text-white">
								Users
							</TabsTrigger>
							<TabsTrigger
								value="transactions"
								className="data-[state=active]:bg-app-primary data-[state=active]:text-white">
								Transactions
							</TabsTrigger>
							<TabsTrigger
								value="challenges"
								className="data-[state=active]:bg-app-primary data-[state=active]:text-white">
								Challenges
							</TabsTrigger>
						</TabsList>

						<div className="tabs-content-fix">
							<TabsContent value="overview" className="space-y-6">
								<div className="grid gap-6 md:grid-cols-2">
									{/* Enhanced User Growth Chart */}
									<Card className=" border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<TrendingUp className="w-5 h-5 text-app-primary" />
												<CardTitle className="text-lg font-semibold">
													User Growth
												</CardTitle>
											</div>
											<CardDescription>
												New user registrations over time
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="h-[300px]">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart data={chartData.userGrowthData}>
														<XAxis dataKey="date" />
														<YAxis />
														<Tooltip
															contentStyle={{
																backgroundColor: "rgba(255, 255, 255, 0.1)",
																backdropFilter: "blur(10px)",
																border: "1px solid rgba(255, 255, 255, 0.2)",
																borderRadius: "8px",
															}}
														/>
														<Bar
															dataKey="users"
															fill="url(#userGradient)"
															name="New Users"
															radius={[4, 4, 0, 0]}
														/>
														<defs>
															<linearGradient
																id="userGradient"
																x1="0"
																y1="0"
																x2="0"
																y2="1">
																<stop offset="0%" stopColor="#8b5cf6" />
																<stop offset="100%" stopColor="#a855f7" />
															</linearGradient>
														</defs>
													</BarChart>
												</ResponsiveContainer>
											</div>
										</CardContent>
									</Card>

									{/* Enhanced Transaction Types Chart */}
									<Card className=" border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<PieChart className="w-5 h-5 text-app-secondary" />
												<CardTitle className="text-lg font-semibold">
													Transaction Types
												</CardTitle>
											</div>
											<CardDescription>
												Distribution of transaction categories
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="h-[300px] flex items-center justify-center">
												{chartData.transactionTypeData.length > 0 ? (
													<ResponsiveContainer width="100%" height="100%">
														<RePieChart>
															<Pie
																data={chartData.transactionTypeData}
																cx="50%"
																cy="50%"
																labelLine={false}
																outerRadius={80}
																fill="#8884d8"
																dataKey="value"
																label={({ name, percent }) =>
																	`${name}: ${(percent * 100).toFixed(0)}%`
																}>
																{chartData.transactionTypeData.map(
																	(entry, index) => (
																		<Cell
																			key={`cell-${index}`}
																			fill={COLORS[index % COLORS.length]}
																		/>
																	)
																)}
															</Pie>
															<Tooltip
																contentStyle={{
																	backgroundColor: "rgba(255, 255, 255, 0.1)",
																	backdropFilter: "blur(10px)",
																	border: "1px solid rgba(255, 255, 255, 0.2)",
																	borderRadius: "8px",
																}}
															/>
														</RePieChart>
													</ResponsiveContainer>
												) : (
													<div className="flex flex-col items-center gap-2">
														<div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
															<PieChart className="w-6 h-6 text-muted-foreground" />
														</div>
														<p className="text-muted-foreground">
															No transaction data available
														</p>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</div>

								<div className="grid gap-6 md:grid-cols-2">
									{/* Enhanced Transaction Trends Chart */}
									<Card className=" border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<Activity className="w-5 h-5 text-green-500" />
												<CardTitle className="text-lg font-semibold">
													Transaction Trends
												</CardTitle>
											</div>
											<CardDescription>
												Transaction volume and amount over time
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="h-[300px]">
												<ResponsiveContainer width="100%" height="100%">
													<ReLineChart data={chartData.transactionTrendsData}>
														<CartesianGrid
															strokeDasharray="3 3"
															stroke="rgba(255, 255, 255, 0.1)"
														/>
														<XAxis dataKey="date" />
														<YAxis
															yAxisId="left"
															orientation="left"
															stroke="#8b5cf6"
														/>
														<YAxis
															yAxisId="right"
															orientation="right"
															stroke="#f59e0b"
														/>
														<Tooltip
															contentStyle={{
																backgroundColor: "rgba(255, 255, 255, 0.1)",
																backdropFilter: "blur(10px)",
																border: "1px solid rgba(255, 255, 255, 0.2)",
																borderRadius: "8px",
															}}
														/>
														<Line
															yAxisId="left"
															type="monotone"
															dataKey="amount"
															stroke="#8b5cf6"
															strokeWidth={3}
															name="Amount"
															dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
														/>
														<Line
															yAxisId="right"
															type="monotone"
															dataKey="count"
															stroke="#f59e0b"
															strokeWidth={3}
															name="Count"
															dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
														/>
													</ReLineChart>
												</ResponsiveContainer>
											</div>
										</CardContent>
									</Card>

									{/* Enhanced Challenge Completion Chart */}
									<Card className=" border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<Trophy className="w-5 h-5 text-yellow-500" />
												<CardTitle className="text-lg font-semibold">
													Challenge Status
												</CardTitle>
											</div>
											<CardDescription>
												Current status of all challenges
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="h-[300px] flex items-center justify-center">
												{chartData.challengeCompletionData.length > 0 ? (
													<ResponsiveContainer width="100%" height="100%">
														<RePieChart>
															<Pie
																data={chartData.challengeCompletionData}
																cx="50%"
																cy="50%"
																labelLine={false}
																outerRadius={80}
																fill="#8884d8"
																dataKey="value"
																label={({ name, percent }) =>
																	`${name}: ${(percent * 100).toFixed(0)}%`
																}>
																{chartData.challengeCompletionData.map(
																	(entry, index) => (
																		<Cell
																			key={`cell-${index}`}
																			fill={COLORS[index % COLORS.length]}
																		/>
																	)
																)}
															</Pie>
															<Tooltip
																contentStyle={{
																	backgroundColor: "rgba(255, 255, 255, 0.1)",
																	backdropFilter: "blur(10px)",
																	border: "1px solid rgba(255, 255, 255, 0.2)",
																	borderRadius: "8px",
																}}
															/>
														</RePieChart>
													</ResponsiveContainer>
												) : (
													<div className="flex flex-col items-center gap-2">
														<div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
															<Trophy className="w-6 h-6 text-muted-foreground" />
														</div>
														<p className="text-muted-foreground">
															No challenge data available
														</p>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							{/* Similar enhancements for other tabs... */}
							<TabsContent value="users" className="space-y-6">
								<div className="grid gap-6 md:grid-cols-2">
									<Card className="glass-effect border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<Users className="w-5 h-5 text-app-primary" />
												<CardTitle className="text-lg font-semibold">
													User Growth
												</CardTitle>
											</div>
											<CardDescription>
												New user registrations over time
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="h-[300px]">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart data={chartData.userGrowthData}>
														<XAxis dataKey="date" />
														<YAxis />
														<Tooltip
															contentStyle={{
																backgroundColor: "rgba(255, 255, 255, 0.1)",
																backdropFilter: "blur(10px)",
																border: "1px solid rgba(255, 255, 255, 0.2)",
																borderRadius: "8px",
															}}
														/>
														<Bar
															dataKey="users"
															fill="url(#userGradient)"
															name="New Users"
															radius={[4, 4, 0, 0]}
														/>
													</BarChart>
												</ResponsiveContainer>
											</div>
										</CardContent>
									</Card>

									<Card className=" border-white/20 hover-lift transition-all duration-300">
										<CardHeader className="pb-2">
											<CardTitle className="text-lg font-semibold">
												User Rank Distribution
											</CardTitle>
											<CardDescription>
												Distribution of users by activity rank
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											{rankStats.length > 0 ? (
												<div className="space-y-4">
													{rankStats.map((rankStat) => (
														<div key={rankStat.rank} className="space-y-2">
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium">
																	{rankStat.rank === "UNRANKED"
																		? "Unranked"
																		: rankStat.rank.replace("_", " ")}
																</span>
																<span className="text-sm text-muted-foreground">
																	{formatNumber(rankStat.count)} users (
																	{rankStat.percentage}%)
																</span>
															</div>
															<Progress
																value={rankStat.percentage}
																className="h-2"
															/>
														</div>
													))}
												</div>
											) : (
												<div className="flex items-center justify-center h-[200px]">
													<p className="text-muted-foreground">
														No rank data available
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							{/* Continue with other tabs... */}
						</div>
					</Tabs>
				</CardContent>
			</Card>

			<WithdrawalOverview withdrawalStats={withdrawalStats} stats={stats} />

			<div className="grid gap-6 md:grid-cols-7">
				{/* Enhanced User Ranks Distribution */}
				<Card className="col-span-3 glass-effect border-white/20 shadow-glow">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Trophy className="w-5 h-5 text-app-primary" />
							<CardTitle>User Ranks Distribution</CardTitle>
						</div>
						<CardDescription>
							Distribution of users by activity rank
						</CardDescription>
					</CardHeader>
					<CardContent>
						{rankStats.length > 0 ? (
							<div className="space-y-4">
								{rankStats.map((rankStat) => (
									<div key={rankStat.rank} className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												{rankStat.rank === "UNRANKED"
													? "Unranked"
													: rankStat.rank.replace("_", " ")}
											</span>
											<span className="text-sm text-muted-foreground">
												{formatNumber(rankStat.count)} users (
												{rankStat.percentage}%)
											</span>
										</div>
										<Progress value={rankStat.percentage} className="h-2" />
									</div>
								))}
							</div>
						) : (
							<div className="flex items-center justify-center h-[200px]">
								<p className="text-muted-foreground">No rank data available</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Enhanced Recent Users */}
				<Card className="glass-effect border-white/20 shadow-glow">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-app-primary" />
								<CardTitle>Recent Users</CardTitle>
							</div>
							<CardDescription>Latest user registrations</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="glass-effect border-white/20 hover:border-app-primary/30">
							<Link href="/dashboard/users">
								View All
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						{recentUsers.length > 0 ? (
							<div className="space-y-3">
								{recentUsers.map((user) => (
									<div
										key={user.id}
										className="flex items-center justify-between p-4 glass-effect border-white/10 rounded-xl hover:border-app-primary/20 transition-all duration-300 hover-lift">
										<div className="flex-1">
											<p className="font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">
												{user.email || user.phone}
											</p>
											<div className="flex items-center gap-2 mt-1">
												<span
													className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
														user.isProfileCompleted
															? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
															: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
													}`}>
													{user.isProfileCompleted ? "Complete" : "Incomplete"}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatNumber(user.walletBalance)} points
												</span>
											</div>
										</div>
										<div className="text-right">
											<p className="text-xs text-muted-foreground">
												{formatDate(user.createdAt)}
											</p>
											<Button
												variant="outline"
												size="sm"
												asChild
												className="mt-2">
												<Link href={`/dashboard/users/${user.id}`}>View</Link>
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex items-center justify-center h-[200px]">
								<p className="text-muted-foreground">No recent users</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Enhanced Recent Transactions */}
				<Card className="glass-effect border-white/20 shadow-glow">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<CreditCard className="w-5 h-5 text-app-secondary" />
								<CardTitle>Recent Transactions</CardTitle>
							</div>
							<CardDescription>Latest point transactions</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="glass-effect border-white/20 hover:border-app-primary/30">
							<Link href="/dashboard/transactions">
								View All
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						{recentTransactions.length > 0 ? (
							<div className="space-y-3">
								{recentTransactions.map((transaction) => (
									<div
										key={transaction.id}
										className="flex items-center justify-between p-4 glass-effect border-white/10 rounded-xl hover:border-app-primary/20 transition-all duration-300 hover-lift">
										<div className="flex-1">
											<p className="font-medium">
												{transaction.user?.name || "Unknown User"}
											</p>
											<p className="text-xs text-muted-foreground">
												{transaction.description || transaction.transactionType}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{transaction.transactionType}
											</p>
										</div>
										<div className="text-right">
											<p
												className={`font-medium ${
													transaction.amount > 0
														? "text-green-600 dark:text-green-400"
														: "text-red-600 dark:text-red-400"
												}`}>
												{transaction.amount > 0 ? "+" : ""}
												{formatNumber(transaction.amount)}{" "}
												{transaction.amountType}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatDate(transaction.createdAt)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex items-center justify-center h-[200px]">
								<p className="text-muted-foreground">No recent transactions</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Quick Actions */}
			<Card className="glass-effect border-white/20 shadow-glow">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Activity className="w-5 h-5 text-app-primary" />
						<CardTitle>Quick Actions</CardTitle>
					</div>
					<CardDescription>Common administrative tasks</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Button
							className="h-20 flex-col gap-2 btn-gradient-primary hover-lift transition-all duration-300"
							asChild>
							<Link href="/dashboard/users/new">
								<UserPlus className="h-6 w-6" />
								Add New User
							</Link>
						</Button>

						<Button
							variant="outline"
							className="h-20 flex-col gap-2 glass-effect border-white/20 hover:border-app-primary/30 hover-lift transition-all duration-300"
							asChild>
							<Link href="/dashboard/challenges">
								<Trophy className="h-6 w-6" />
								Manage Challenges
							</Link>
						</Button>

						<Button
							variant="outline"
							className="h-20 flex-col gap-2 glass-effect border-white/20 hover:border-app-secondary/30 hover-lift transition-all duration-300"
							asChild>
							<Link href="/dashboard/withdrawals">
								<CreditCard className="h-6 w-6" />
								Review Withdrawals
							</Link>
						</Button>

						<Button
							variant="outline"
							className="h-20 flex-col gap-2 glass-effect border-white/20 hover:border-green-500/30 hover-lift transition-all duration-300"
							asChild>
							<Link href="/dashboard/transactions">
								<Activity className="h-6 w-6" />
								View Transactions
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
// 	Activity,
// 	CreditCard,
// 	Users,
// 	Trophy,
// 	ArrowUpRight,
// 	CheckCircle,
// 	UserPlus,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { toast } from "@/components/ui/use-toast";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
// import {
// 	format,
// 	subDays,
// 	parseISO,
// 	isAfter,
// 	isBefore,
// 	startOfDay,
// 	endOfDay,
// } from "date-fns";
// import {
// 	BarChart,
// 	Bar,
// 	XAxis,
// 	YAxis,
// 	Tooltip,
// 	ResponsiveContainer,
// 	PieChart as RePieChart,
// 	Pie,
// 	Cell,
// 	LineChart as ReLineChart,
// 	Line,
// 	CartesianGrid,
// } from "recharts";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";

// import { DashboardStats } from "@/components/dashboard/dashboard-stats";
// import { WithdrawalOverview } from "@/components/dashboard/withdrawal-overview";

// // Define the base API URL
// const API_URL = "http://localhost:3001"; // Update this with your actual API URL

// // Define the auth token - in a real app, this would come from a secure auth context
// const AUTH_TOKEN =
// 	"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJhZG1pbjEyQGdtYWlsLmNvbSIsImlzUG9ydGFsVXNlciI6dHJ1ZSwiaWF0IjoxNzQ3NDY5MDkwLCJleHAiOjE3NTAwNjEwOTB9.ZNMZ1ymCn76MyGYalLbrxhpcbVYC-suGS34K9TCik2M";

// interface SystemStats {
// 	users: {
// 		total: number;
// 		newLastWeek: number;
// 	};
// 	challenges: {
// 		total: number;
// 		active: number;
// 	};
// 	transactions: {
// 		count: number;
// 		totalAmount: number;
// 	};
// 	activities: {
// 		count: number;
// 		totalSteps: number;
// 		recentCount: number;
// 	};
// 	withdrawals: {
// 		pendingCount: number;
// 		pendingAmount: number;
// 	};
// }

// interface RankStats {
// 	rank: string;
// 	count: number;
// 	percentage: number;
// }

// interface User {
// 	id: number;
// 	name: string;
// 	email: string | null;
// 	phone: string;
// 	age: number | null;
// 	gender: string | null;
// 	rank: string | null;
// 	isProfileCompleted: boolean;
// 	createdAt: string;
// 	updatedAt: string;
// 	walletBalance: number;
// 	roles: string[];
// }

// interface Transaction {
// 	id: number;
// 	walletId: number;
// 	amount: number;
// 	amountType: string;
// 	transactionType: string;
// 	description: string | null;
// 	createdAt: string;
// 	updatedAt: string;
// 	userId: number;
// 	user: {
// 		id: number;
// 		name: string;
// 		email: string | null;
// 	};
// }

// interface Challenge {
// 	id: number;
// 	name: string;
// 	joiningCost: number;
// 	startDate: string;
// 	endDate: string;
// 	expiryDate: string;
// 	description: string;
// 	stepsRequired: number;
// 	minParticipants: number;
// 	participants: number;
// 	participantsList: Array<{
// 		userId: number;
// 		userName: string;
// 		userEmail: string;
// 		steps: number;
// 		joinDate: string;
// 		progress: number;
// 	}>;
// }

// interface DateRange {
// 	from: Date | undefined;
// 	to: Date | undefined;
// }

// interface ChartData {
// 	userGrowthData: Array<{ date: string; users: number }>;
// 	transactionTypeData: Array<{ name: string; value: number }>;
// 	challengeCompletionData: Array<{ name: string; value: number }>;
// 	userDemographicsAge: Array<{ age: string; count: number }>;
// 	userDemographicsGender: Array<{ name: string; value: number }>;
// 	challengeParticipationData: Array<{ name: string; participants: number }>;
// 	transactionTrendsData: Array<{ date: string; amount: number; count: number }>;
// 	rankProgressData: Array<{ rank: string; avgSteps: number }>;
// }

// const COLORS = [
// 	"#0088FE",
// 	"#00C49F",
// 	"#FFBB28",
// 	"#FF8042",
// 	"#8884d8",
// 	"#82ca9d",
// 	"#ffc658",
// ];

// export default function DashboardPage() {
// 	const [stats, setStats] = useState<SystemStats | null>(null);
// 	const [rankStats, setRankStats] = useState<RankStats[]>([]);
// 	const [recentUsers, setRecentUsers] = useState<User[]>([]);
// 	const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
// 		[]
// 	);
// 	const [allUsers, setAllUsers] = useState<User[]>([]);
// 	const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
// 	const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [analyticsLoading, setAnalyticsLoading] = useState(false);
// 	const [profileCompletionStats, setProfileCompletionStats] = useState({
// 		completed: 0,
// 		incomplete: 0,
// 		percentage: 0,
// 	});
// 	const [withdrawalStats, setWithdrawalStats] = useState({
// 		pending: 0,
// 		approved: 0,
// 		rejected: 0,
// 	});
// 	const [dateRange, setDateRange] = useState<DateRange>({
// 		from: subDays(new Date(), 30),
// 		to: new Date(),
// 	});
// 	const [dateFilterOption, setDateFilterOption] = useState("30days");
// 	const [chartData, setChartData] = useState<ChartData>({
// 		userGrowthData: [],
// 		transactionTypeData: [],
// 		challengeCompletionData: [],
// 		userDemographicsAge: [],
// 		userDemographicsGender: [],
// 		challengeParticipationData: [],
// 		transactionTrendsData: [],
// 		rankProgressData: [],
// 	});

// 	useEffect(() => {
// 		fetchDashboardData();
// 	}, []);

// 	useEffect(() => {
// 		if (
// 			allUsers.length > 0 ||
// 			allTransactions.length > 0 ||
// 			allChallenges.length > 0
// 		) {
// 			processAnalyticsData();
// 		}
// 	}, [dateRange, allUsers, allTransactions, allChallenges]);

// 	const handleDateFilterChange = (value: string) => {
// 		setDateFilterOption(value);
// 		const today = new Date();

// 		switch (value) {
// 			case "7days":
// 				setDateRange({ from: subDays(today, 7), to: today });
// 				break;
// 			case "30days":
// 				setDateRange({ from: subDays(today, 30), to: today });
// 				break;
// 			case "90days":
// 				setDateRange({ from: subDays(today, 90), to: today });
// 				break;
// 			case "thisYear":
// 				setDateRange({ from: new Date(today.getFullYear(), 0, 1), to: today });
// 				break;
// 			case "custom":
// 				// Keep the current custom range
// 				break;
// 		}
// 	};

// 	const handleCustomDateRangeChange = (range: DateRange) => {
// 		if (range.from && range.to) {
// 			setDateRange(range);
// 			setDateFilterOption("custom");
// 		}
// 	};

// 	const filterDataByDateRange = <
// 		T extends { createdAt?: string; startDate?: string; date?: string }
// 	>(
// 		data: T[],
// 		dateField: keyof T = "createdAt" as keyof T
// 	): T[] => {
// 		if (!dateRange.from || !dateRange.to) return data;

// 		const fromDate = startOfDay(dateRange.from);
// 		const toDate = endOfDay(dateRange.to);

// 		return data.filter((item) => {
// 			const itemDate = item[dateField] as string;
// 			if (!itemDate) return false;

// 			const date = parseISO(itemDate);
// 			return isAfter(date, fromDate) && isBefore(date, toDate);
// 		});
// 	};

// 	const processAnalyticsData = () => {
// 		setAnalyticsLoading(true);

// 		try {
// 			// Filter data by date range
// 			const filteredUsers = filterDataByDateRange(allUsers);
// 			const filteredTransactions = filterDataByDateRange(allTransactions);
// 			const filteredChallenges = filterDataByDateRange(
// 				allChallenges,
// 				"startDate"
// 			);

// 			// Process User Growth Data
// 			const userGrowthData = processUserGrowthData(filteredUsers);

// 			// Process Transaction Type Data
// 			const transactionTypeData =
// 				processTransactionTypeData(filteredTransactions);

// 			// Process Transaction Trends Data
// 			const transactionTrendsData =
// 				processTransactionTrendsData(filteredTransactions);

// 			// Process Challenge Data
// 			const challengeCompletionData =
// 				processChallengeCompletionData(allChallenges);
// 			const challengeParticipationData =
// 				processChallengeParticipationData(filteredChallenges);

// 			// Process User Demographics
// 			const userDemographicsAge = processUserDemographicsAge(allUsers);
// 			const userDemographicsGender = processUserDemographicsGender(allUsers);

// 			// Process Rank Progress Data
// 			const rankProgressData = processRankProgressData();

// 			setChartData({
// 				userGrowthData,
// 				transactionTypeData,
// 				challengeCompletionData,
// 				userDemographicsAge,
// 				userDemographicsGender,
// 				challengeParticipationData,
// 				transactionTrendsData,
// 				rankProgressData,
// 			});
// 		} catch (error) {
// 			console.error("Error processing analytics data:", error);
// 		} finally {
// 			setAnalyticsLoading(false);
// 		}
// 	};

// 	const processUserGrowthData = (users: User[]) => {
// 		const growthMap = new Map<string, number>();

// 		users.forEach((user) => {
// 			const date = format(parseISO(user.createdAt), "MMM dd");
// 			growthMap.set(date, (growthMap.get(date) || 0) + 1);
// 		});

// 		return Array.from(growthMap.entries())
// 			.map(([date, users]) => ({ date, users }))
// 			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
// 			.slice(-30); // Show last 30 data points
// 	};

// 	const processTransactionTypeData = (transactions: Transaction[]) => {
// 		const typeMap = new Map<string, number>();

// 		transactions.forEach((transaction) => {
// 			const type = transaction.transactionType;
// 			typeMap.set(type, (typeMap.get(type) || 0) + 1);
// 		});

// 		return Array.from(typeMap.entries()).map(([name, value]) => ({
// 			name,
// 			value,
// 		}));
// 	};

// 	const processTransactionTrendsData = (transactions: Transaction[]) => {
// 		const trendsMap = new Map<string, { amount: number; count: number }>();

// 		transactions.forEach((transaction) => {
// 			const date = format(parseISO(transaction.createdAt), "MMM dd");
// 			const existing = trendsMap.get(date) || { amount: 0, count: 0 };
// 			trendsMap.set(date, {
// 				amount: existing.amount + Math.abs(transaction.amount),
// 				count: existing.count + 1,
// 			});
// 		});

// 		return Array.from(trendsMap.entries())
// 			.map(([date, data]) => ({ date, ...data }))
// 			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
// 			.slice(-30); // Show last 30 data points
// 	};

// 	const processChallengeCompletionData = (challenges: Challenge[]) => {
// 		let completed = 0;
// 		let inProgress = 0;
// 		let notStarted = 0;

// 		const now = new Date();

// 		challenges.forEach((challenge) => {
// 			const endDate = parseISO(challenge.endDate);
// 			const startDate = parseISO(challenge.startDate);

// 			if (isAfter(now, endDate)) {
// 				completed++;
// 			} else if (isAfter(now, startDate)) {
// 				inProgress++;
// 			} else {
// 				notStarted++;
// 			}
// 		});

// 		return [
// 			{ name: "Completed", value: completed },
// 			{ name: "In Progress", value: inProgress },
// 			{ name: "Not Started", value: notStarted },
// 		];
// 	};

// 	const processChallengeParticipationData = (challenges: Challenge[]) => {
// 		return challenges
// 			.map((challenge) => ({
// 				name:
// 					challenge.name.length > 15
// 						? challenge.name.substring(0, 15) + "..."
// 						: challenge.name,
// 				participants: challenge.participants || 0,
// 			}))
// 			.slice(0, 10); // Show top 10 challenges
// 	};

// 	const processUserDemographicsAge = (users: User[]) => {
// 		const ageGroups = {
// 			"18-24": 0,
// 			"25-34": 0,
// 			"35-44": 0,
// 			"45-54": 0,
// 			"55+": 0,
// 			"Unknown": 0,
// 		};

// 		users.forEach((user) => {
// 			if (!user.age) {
// 				ageGroups["Unknown"]++;
// 				return;
// 			}

// 			if (user.age >= 18 && user.age <= 24) ageGroups["18-24"]++;
// 			else if (user.age >= 25 && user.age <= 34) ageGroups["25-34"]++;
// 			else if (user.age >= 35 && user.age <= 44) ageGroups["35-44"]++;
// 			else if (user.age >= 45 && user.age <= 54) ageGroups["45-54"]++;
// 			else if (user.age >= 55) ageGroups["55+"]++;
// 			else ageGroups["Unknown"]++;
// 		});

// 		return Object.entries(ageGroups).map(([age, count]) => ({ age, count }));
// 	};

// 	const processUserDemographicsGender = (users: User[]) => {
// 		const genderCounts = {
// 			MALE: 0,
// 			FEMALE: 0,
// 			Unknown: 0,
// 		};

// 		users.forEach((user) => {
// 			if (user.gender === "MALE") genderCounts.MALE++;
// 			else if (user.gender === "FEMALE") genderCounts.FEMALE++;
// 			else genderCounts.Unknown++;
// 		});

// 		return [
// 			{ name: "Male", value: genderCounts.MALE },
// 			{ name: "Female", value: genderCounts.FEMALE },
// 			{ name: "Unknown", value: genderCounts.Unknown },
// 		].filter((item) => item.value > 0);
// 	};

// 	const processRankProgressData = () => {
// 		// This would ideally come from walking activities data
// 		// For now, we'll use estimated values based on rank requirements
// 		return [
// 			{ rank: "BEGINNER", avgSteps: 2500 },
// 			{ rank: "WALKER", avgSteps: 5000 },
// 			{ rank: "ACTIVE_WALKER", avgSteps: 8000 },
// 			{ rank: "PRO_WALKER", avgSteps: 12000 },
// 			{ rank: "MASTER_WALKER", avgSteps: 18000 },
// 			{ rank: "ELITE_WALKER", avgSteps: 25000 },
// 		];
// 	};

// 	const fetchDashboardData = async () => {
// 		try {
// 			setLoading(true);

// 			// Fetch system statistics
// 			const statsResponse = await fetch(`${API_URL}/api/admin/statistics`, {
// 				headers: {
// 					Authorization: AUTH_TOKEN,
// 				},
// 			});

// 			if (statsResponse.ok) {
// 				const statsData = await statsResponse.json();
// 				setStats(statsData.statistics);
// 			} else {
// 				console.error(
// 					"Failed to fetch statistics:",
// 					await statsResponse.text()
// 				);
// 				toast({
// 					title: "Error",
// 					description: "Failed to fetch system statistics",
// 					variant: "destructive",
// 				});
// 			}

// 			// Fetch rank statistics
// 			const rankResponse = await fetch(
// 				`${API_URL}/api/admin/statistics/ranks`,
// 				{
// 					headers: {
// 						Authorization: AUTH_TOKEN,
// 					},
// 				}
// 			);

// 			if (rankResponse.ok) {
// 				const rankData = await rankResponse.json();
// 				setRankStats(rankData.rankStatistics || []);
// 			} else {
// 				console.error(
// 					"Failed to fetch rank statistics:",
// 					await rankResponse.text()
// 				);
// 			}

// 			// Fetch all users for analytics
// 			const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
// 				headers: {
// 					Authorization: AUTH_TOKEN,
// 				},
// 			});

// 			if (usersResponse.ok) {
// 				const usersData = await usersResponse.json();
// 				setAllUsers(usersData.users || []);
// 				setRecentUsers(usersData.users?.slice(0, 5) || []);

// 				// Calculate profile completion stats
// 				if (usersData.users && usersData.users.length > 0) {
// 					const completed = usersData.users.filter(
// 						(user: User) => user.isProfileCompleted
// 					).length;
// 					const total = usersData.users.length;
// 					setProfileCompletionStats({
// 						completed,
// 						incomplete: total - completed,
// 						percentage: Math.round((completed / total) * 100),
// 					});
// 				}
// 			} else {
// 				console.error("Failed to fetch users:", await usersResponse.text());
// 			}

// 			// Fetch all transactions for analytics
// 			const transactionsResponse = await fetch(
// 				`${API_URL}/api/admin/transactions`,
// 				{
// 					headers: {
// 						Authorization: AUTH_TOKEN,
// 					},
// 				}
// 			);

// 			if (transactionsResponse.ok) {
// 				const transactionsData = await transactionsResponse.json();
// 				setAllTransactions(transactionsData.transactions || []);
// 				setRecentTransactions(transactionsData.transactions?.slice(0, 5) || []);
// 			} else {
// 				console.error(
// 					"Failed to fetch transactions:",
// 					await transactionsResponse.text()
// 				);
// 			}

// 			// Fetch all challenges for analytics
// 			const challengesResponse = await fetch(
// 				`${API_URL}/api/admin/challenges`,
// 				{
// 					headers: {
// 						Authorization: AUTH_TOKEN,
// 					},
// 				}
// 			);

// 			if (challengesResponse.ok) {
// 				const challengesData = await challengesResponse.json();
// 				setAllChallenges(challengesData.challenges || []);
// 			} else {
// 				console.error(
// 					"Failed to fetch challenges:",
// 					await challengesResponse.text()
// 				);
// 			}

// 			// Fetch withdrawal requests to calculate stats
// 			const withdrawalsResponse = await fetch(
// 				`${API_URL}/api/admin/withdrawals`,
// 				{
// 					headers: {
// 						Authorization: AUTH_TOKEN,
// 					},
// 				}
// 			);

// 			if (withdrawalsResponse.ok) {
// 				const withdrawalsData = await withdrawalsResponse.json();
// 				const pending =
// 					withdrawalsData.withdrawRequests?.filter(
// 						(w: any) => w.status === "Pending"
// 					).length || 0;
// 				const approved =
// 					withdrawalsData.withdrawRequests?.filter(
// 						(w: any) => w.status === "Approved"
// 					).length || 0;
// 				const rejected =
// 					withdrawalsData.withdrawRequests?.filter(
// 						(w: any) => w.status === "Rejected"
// 					).length || 0;

// 				setWithdrawalStats({
// 					pending,
// 					approved,
// 					rejected,
// 				});
// 			} else {
// 				console.error(
// 					"Failed to fetch withdrawals:",
// 					await withdrawalsResponse.text()
// 				);
// 			}
// 		} catch (error) {
// 			console.error("Error fetching dashboard data:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to fetch dashboard data. Please try again.",
// 				variant: "destructive",
// 			});
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const formatDate = (dateString: string) => {
// 		return new Date(dateString).toLocaleDateString("en-US", {
// 			year: "numeric",
// 			month: "short",
// 			day: "numeric",
// 		});
// 	};

// 	const formatNumber = (num: number) => {
// 		return new Intl.NumberFormat().format(num);
// 	};

// 	if (loading) {
// 		return (
// 			<div className="flex flex-col gap-6">
// 				<div className="flex flex-col gap-2">
// 					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
// 					<p className="text-muted-foreground">Welcome to Promo Tech Admin</p>
// 				</div>
// 				<div className="flex items-center justify-center h-64">
// 					<div className="flex flex-col items-center gap-2">
// 						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
// 						<p className="text-sm text-muted-foreground">
// 							Loading dashboard...
// 						</p>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="flex flex-col gap-6">
// 			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// 				<div className="flex flex-col gap-2">
// 					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
// 					<p className="text-muted-foreground">Welcome to Promo Tech Admin</p>
// 				</div>

// 				{/* Date Filter Controls */}
// 				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
// 					<div className="flex items-center gap-2">
// 						<Select
// 							value={dateFilterOption}
// 							onValueChange={handleDateFilterChange}>
// 							<SelectTrigger className="w-[180px]">
// 								<SelectValue placeholder="Select date range" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value="7days">Last 7 Days</SelectItem>
// 								<SelectItem value="30days">Last 30 Days</SelectItem>
// 								<SelectItem value="90days">Last 90 Days</SelectItem>
// 								<SelectItem value="thisYear">This Year</SelectItem>
// 								<SelectItem value="custom">Custom Range</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					<DatePickerWithRange
// 						date={dateRange}
// 						setDate={handleCustomDateRangeChange as any}
// 						className={
// 							dateFilterOption === "custom"
// 								? "opacity-100"
// 								: "opacity-50 pointer-events-none"
// 						}
// 					/>
// 				</div>
// 			</div>

// 			{/* Key Metrics Cards */}
// 			<DashboardStats
// 				stats={stats}
// 				profileCompletionStats={profileCompletionStats}
// 				loading={loading}
// 			/>

// 			{/* Analytics Section */}
// 			<Card className="dashboard-card shadow-sm">
// 				<CardHeader>
// 					<CardTitle>Analytics Dashboard</CardTitle>
// 					<CardDescription>
// 						Key performance metrics and trends based on real-time data
// 					</CardDescription>
// 				</CardHeader>
// 				<CardContent>
// 					{analyticsLoading && (
// 						<div className="flex items-center justify-center py-8">
// 							<div className="flex items-center gap-2">
// 								<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
// 								<span className="text-sm text-muted-foreground">
// 									Updating analytics...
// 								</span>
// 							</div>
// 						</div>
// 					)}

// 					<Tabs defaultValue="overview" className="space-y-6 tabs-fix">
// 						<TabsList className="grid grid-cols-4 md:w-[600px]">
// 							<TabsTrigger value="overview">Overview</TabsTrigger>
// 							<TabsTrigger value="users">Users</TabsTrigger>
// 							<TabsTrigger value="transactions">Transactions</TabsTrigger>
// 							<TabsTrigger value="challenges">Challenges</TabsTrigger>
// 						</TabsList>

// 						<div className="tabs-content-fix">
// 							<TabsContent value="overview" className="space-y-6">
// 								<div className="grid gap-6 md:grid-cols-2">
// 									{/* User Growth Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">User Growth</CardTitle>
// 											<CardDescription>
// 												New user registrations over time
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px]">
// 												<ResponsiveContainer width="100%" height="100%">
// 													<BarChart data={chartData.userGrowthData}>
// 														<XAxis dataKey="date" />
// 														<YAxis />
// 														<Tooltip />
// 														<Bar
// 															dataKey="users"
// 															fill="#8884d8"
// 															name="New Users"
// 														/>
// 													</BarChart>
// 												</ResponsiveContainer>
// 											</div>
// 										</CardContent>
// 									</Card>

// 									{/* Transaction Types Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Transaction Types
// 											</CardTitle>
// 											<CardDescription>
// 												Distribution of transaction categories
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px] flex items-center justify-center">
// 												{chartData.transactionTypeData.length > 0 ? (
// 													<ResponsiveContainer width="100%" height="100%">
// 														<RePieChart>
// 															<Pie
// 																data={chartData.transactionTypeData}
// 																cx="50%"
// 																cy="50%"
// 																labelLine={false}
// 																outerRadius={80}
// 																fill="#8884d8"
// 																dataKey="value"
// 																label={({ name, percent }) =>
// 																	`${name}: ${(percent * 100).toFixed(0)}%`
// 																}>
// 																{chartData.transactionTypeData.map(
// 																	(entry, index) => (
// 																		<Cell
// 																			key={`cell-${index}`}
// 																			fill={COLORS[index % COLORS.length]}
// 																		/>
// 																	)
// 																)}
// 															</Pie>
// 															<Tooltip />
// 														</RePieChart>
// 													</ResponsiveContainer>
// 												) : (
// 													<p className="text-muted-foreground">
// 														No transaction data available
// 													</p>
// 												)}
// 											</div>
// 										</CardContent>
// 									</Card>
// 								</div>

// 								<div className="grid gap-6 md:grid-cols-2">
// 									{/* Transaction Trends Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Transaction Trends
// 											</CardTitle>
// 											<CardDescription>
// 												Transaction volume and amount over time
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px]">
// 												<ResponsiveContainer width="100%" height="100%">
// 													<ReLineChart data={chartData.transactionTrendsData}>
// 														<CartesianGrid strokeDasharray="3 3" />
// 														<XAxis dataKey="date" />
// 														<YAxis
// 															yAxisId="left"
// 															orientation="left"
// 															stroke="#8884d8"
// 														/>
// 														<YAxis
// 															yAxisId="right"
// 															orientation="right"
// 															stroke="#82ca9d"
// 														/>
// 														<Tooltip />
// 														<Line
// 															yAxisId="left"
// 															type="monotone"
// 															dataKey="amount"
// 															stroke="#8884d8"
// 															name="Amount"
// 														/>
// 														<Line
// 															yAxisId="right"
// 															type="monotone"
// 															dataKey="count"
// 															stroke="#82ca9d"
// 															name="Count"
// 														/>
// 													</ReLineChart>
// 												</ResponsiveContainer>
// 											</div>
// 										</CardContent>
// 									</Card>

// 									{/* Challenge Completion Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Challenge Status
// 											</CardTitle>
// 											<CardDescription>
// 												Current status of all challenges
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px] flex items-center justify-center">
// 												{chartData.challengeCompletionData.length > 0 ? (
// 													<ResponsiveContainer width="100%" height="100%">
// 														<RePieChart>
// 															<Pie
// 																data={chartData.challengeCompletionData}
// 																cx="50%"
// 																cy="50%"
// 																labelLine={false}
// 																outerRadius={80}
// 																fill="#8884d8"
// 																dataKey="value"
// 																label={({ name, percent }) =>
// 																	`${name}: ${(percent * 100).toFixed(0)}%`
// 																}>
// 																{chartData.challengeCompletionData.map(
// 																	(entry, index) => (
// 																		<Cell
// 																			key={`cell-${index}`}
// 																			fill={COLORS[index % COLORS.length]}
// 																		/>
// 																	)
// 																)}
// 															</Pie>
// 															<Tooltip />
// 														</RePieChart>
// 													</ResponsiveContainer>
// 												) : (
// 													<p className="text-muted-foreground">
// 														No challenge data available
// 													</p>
// 												)}
// 											</div>
// 										</CardContent>
// 									</Card>
// 								</div>
// 							</TabsContent>

// 							<TabsContent value="users" className="space-y-6">
// 								<div className="grid gap-6 md:grid-cols-2">
// 									{/* User Growth Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">User Growth</CardTitle>
// 											<CardDescription>
// 												New user registrations over time
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px]">
// 												<ResponsiveContainer width="100%" height="100%">
// 													<BarChart data={chartData.userGrowthData}>
// 														<XAxis dataKey="date" />
// 														<YAxis />
// 														<Tooltip />
// 														<Bar
// 															dataKey="users"
// 															fill="#8884d8"
// 															name="New Users"
// 														/>
// 													</BarChart>
// 												</ResponsiveContainer>
// 											</div>
// 										</CardContent>
// 									</Card>

// 									{/* User Rank Distribution */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												User Rank Distribution
// 											</CardTitle>
// 											<CardDescription>
// 												Distribution of users by activity rank
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											{rankStats.length > 0 ? (
// 												<div className="space-y-4">
// 													{rankStats.map((rankStat) => (
// 														<div key={rankStat.rank} className="space-y-2">
// 															<div className="flex items-center justify-between">
// 																<span className="text-sm font-medium">
// 																	{rankStat.rank === "UNRANKED"
// 																		? "Unranked"
// 																		: rankStat.rank.replace("_", " ")}
// 																</span>
// 																<span className="text-sm text-muted-foreground">
// 																	{formatNumber(rankStat.count)} users (
// 																	{rankStat.percentage}%)
// 																</span>
// 															</div>
// 															<Progress
// 																value={rankStat.percentage}
// 																className="h-2"
// 															/>
// 														</div>
// 													))}
// 												</div>
// 											) : (
// 												<div className="flex items-center justify-center h-[200px]">
// 													<p className="text-muted-foreground">
// 														No rank data available
// 													</p>
// 												</div>
// 											)}
// 										</CardContent>
// 									</Card>
// 								</div>

// 								<Card>
// 									<CardHeader className="pb-2">
// 										<CardTitle className="text-base">
// 											User Demographics
// 										</CardTitle>
// 										<CardDescription>
// 											Age and gender distribution
// 										</CardDescription>
// 									</CardHeader>
// 									<CardContent className="pt-0">
// 										<div className="grid gap-6 md:grid-cols-2">
// 											<div className="h-[300px]">
// 												<h4 className="text-sm font-medium mb-2">
// 													Age Distribution
// 												</h4>
// 												<ResponsiveContainer width="100%" height="100%">
// 													<BarChart data={chartData.userDemographicsAge}>
// 														<XAxis dataKey="age" />
// 														<YAxis />
// 														<Tooltip />
// 														<Bar dataKey="count" fill="#0088FE" name="Users" />
// 													</BarChart>
// 												</ResponsiveContainer>
// 											</div>

// 											<div className="h-[300px] flex flex-col">
// 												<h4 className="text-sm font-medium mb-2">
// 													Gender Distribution
// 												</h4>
// 												<div className="flex-1 flex items-center justify-center">
// 													{chartData.userDemographicsGender.length > 0 ? (
// 														<ResponsiveContainer width="100%" height="100%">
// 															<RePieChart>
// 																<Pie
// 																	data={chartData.userDemographicsGender}
// 																	cx="50%"
// 																	cy="50%"
// 																	labelLine={false}
// 																	outerRadius={80}
// 																	fill="#8884d8"
// 																	dataKey="value"
// 																	label={({ name, percent }) =>
// 																		`${name}: ${(percent * 100).toFixed(0)}%`
// 																	}>
// 																	{chartData.userDemographicsGender.map(
// 																		(entry, index) => (
// 																			<Cell
// 																				key={`cell-${index}`}
// 																				fill={COLORS[index % COLORS.length]}
// 																			/>
// 																		)
// 																	)}
// 																</Pie>
// 																<Tooltip />
// 															</RePieChart>
// 														</ResponsiveContainer>
// 													) : (
// 														<p className="text-muted-foreground">
// 															No gender data available
// 														</p>
// 													)}
// 												</div>
// 											</div>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							<TabsContent value="transactions" className="space-y-6">
// 								<div className="grid gap-6 md:grid-cols-2">
// 									{/* Transaction Types Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Transaction Types
// 											</CardTitle>
// 											<CardDescription>
// 												Distribution of transaction categories
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px] flex items-center justify-center">
// 												{chartData.transactionTypeData.length > 0 ? (
// 													<ResponsiveContainer width="100%" height="100%">
// 														<RePieChart>
// 															<Pie
// 																data={chartData.transactionTypeData}
// 																cx="50%"
// 																cy="50%"
// 																labelLine={false}
// 																outerRadius={80}
// 																fill="#8884d8"
// 																dataKey="value"
// 																label={({ name, percent }) =>
// 																	`${name}: ${(percent * 100).toFixed(0)}%`
// 																}>
// 																{chartData.transactionTypeData.map(
// 																	(entry, index) => (
// 																		<Cell
// 																			key={`cell-${index}`}
// 																			fill={COLORS[index % COLORS.length]}
// 																		/>
// 																	)
// 																)}
// 															</Pie>
// 															<Tooltip />
// 														</RePieChart>
// 													</ResponsiveContainer>
// 												) : (
// 													<p className="text-muted-foreground">
// 														No transaction data available
// 													</p>
// 												)}
// 											</div>
// 										</CardContent>
// 									</Card>

// 									{/* Transaction Trends Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Transaction Trends
// 											</CardTitle>
// 											<CardDescription>
// 												Transaction volume and amount over time
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px]">
// 												<ResponsiveContainer width="100%" height="100%">
// 													<ReLineChart data={chartData.transactionTrendsData}>
// 														<CartesianGrid strokeDasharray="3 3" />
// 														<XAxis dataKey="date" />
// 														<YAxis
// 															yAxisId="left"
// 															orientation="left"
// 															stroke="#8884d8"
// 														/>
// 														<YAxis
// 															yAxisId="right"
// 															orientation="right"
// 															stroke="#82ca9d"
// 														/>
// 														<Tooltip />
// 														<Line
// 															yAxisId="left"
// 															type="monotone"
// 															dataKey="amount"
// 															stroke="#8884d8"
// 															name="Amount"
// 														/>
// 														<Line
// 															yAxisId="right"
// 															type="monotone"
// 															dataKey="count"
// 															stroke="#82ca9d"
// 															name="Count"
// 														/>
// 													</ReLineChart>
// 												</ResponsiveContainer>
// 											</div>
// 										</CardContent>
// 									</Card>
// 								</div>

// 								<Card>
// 									<CardHeader className="pb-2">
// 										<CardTitle className="text-base">
// 											Average Steps by Rank
// 										</CardTitle>
// 										<CardDescription>
// 											Estimated daily average steps per user rank
// 										</CardDescription>
// 									</CardHeader>
// 									<CardContent className="pt-0">
// 										<div className="h-[300px]">
// 											<ResponsiveContainer width="100%" height="100%">
// 												<BarChart data={chartData.rankProgressData}>
// 													<XAxis
// 														dataKey="rank"
// 														tickFormatter={(value) => value.replace("_", " ")}
// 													/>
// 													<YAxis />
// 													<Tooltip />
// 													<Bar
// 														dataKey="avgSteps"
// 														fill="#00C49F"
// 														name="Avg. Steps"
// 													/>
// 												</BarChart>
// 											</ResponsiveContainer>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							<TabsContent value="challenges" className="space-y-6">
// 								<div className="grid gap-6 md:grid-cols-2">
// 									{/* Challenge Status Chart */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Challenge Status
// 											</CardTitle>
// 											<CardDescription>
// 												Current status of all challenges
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px] flex items-center justify-center">
// 												{chartData.challengeCompletionData.length > 0 ? (
// 													<ResponsiveContainer width="100%" height="100%">
// 														<RePieChart>
// 															<Pie
// 																data={chartData.challengeCompletionData}
// 																cx="50%"
// 																cy="50%"
// 																labelLine={false}
// 																outerRadius={80}
// 																fill="#8884d8"
// 																dataKey="value"
// 																label={({ name, percent }) =>
// 																	`${name}: ${(percent * 100).toFixed(0)}%`
// 																}>
// 																{chartData.challengeCompletionData.map(
// 																	(entry, index) => (
// 																		<Cell
// 																			key={`cell-${index}`}
// 																			fill={COLORS[index % COLORS.length]}
// 																		/>
// 																	)
// 																)}
// 															</Pie>
// 															<Tooltip />
// 														</RePieChart>
// 													</ResponsiveContainer>
// 												) : (
// 													<p className="text-muted-foreground">
// 														No challenge data available
// 													</p>
// 												)}
// 											</div>
// 										</CardContent>
// 									</Card>

// 									{/* Challenge Participation */}
// 									<Card>
// 										<CardHeader className="pb-2">
// 											<CardTitle className="text-base">
// 												Challenge Participation
// 											</CardTitle>
// 											<CardDescription>
// 												User participation in challenges
// 											</CardDescription>
// 										</CardHeader>
// 										<CardContent className="pt-0">
// 											<div className="h-[300px]">
// 												{chartData.challengeParticipationData.length > 0 ? (
// 													<ResponsiveContainer width="100%" height="100%">
// 														<BarChart
// 															data={chartData.challengeParticipationData}>
// 															<XAxis dataKey="name" />
// 															<YAxis />
// 															<Tooltip />
// 															<Bar
// 																dataKey="participants"
// 																fill="#FFBB28"
// 																name="Participants"
// 															/>
// 														</BarChart>
// 													</ResponsiveContainer>
// 												) : (
// 													<div className="flex items-center justify-center h-full">
// 														<p className="text-muted-foreground">
// 															No challenge participation data available
// 														</p>
// 													</div>
// 												)}
// 											</div>
// 										</CardContent>
// 									</Card>
// 								</div>

// 								<Card>
// 									<CardHeader className="pb-2">
// 										<CardTitle className="text-base">
// 											Challenge Details
// 										</CardTitle>
// 										<CardDescription>
// 											Overview of challenge metrics
// 										</CardDescription>
// 									</CardHeader>
// 									<CardContent className="pt-0">
// 										<div className="grid gap-4 md:grid-cols-3">
// 											<div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
// 												<div className="flex-shrink-0">
// 													<Trophy className="h-8 w-8 text-blue-600" />
// 												</div>
// 												<div>
// 													<p className="text-sm font-medium text-blue-800">
// 														Total Challenges
// 													</p>
// 													<p className="text-2xl font-bold text-blue-600">
// 														{allChallenges.length}
// 													</p>
// 													<p className="text-xs text-blue-700">All time</p>
// 												</div>
// 											</div>

// 											<div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
// 												<div className="flex-shrink-0">
// 													<CheckCircle className="h-8 w-8 text-green-600" />
// 												</div>
// 												<div>
// 													<p className="text-sm font-medium text-green-800">
// 														Active Challenges
// 													</p>
// 													<p className="text-2xl font-bold text-green-600">
// 														{stats ? stats.challenges.active : "0"}
// 													</p>
// 													<p className="text-xs text-green-700">
// 														Currently running
// 													</p>
// 												</div>
// 											</div>

// 											<div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
// 												<div className="flex-shrink-0">
// 													<Users className="h-8 w-8 text-purple-600" />
// 												</div>
// 												<div>
// 													<p className="text-sm font-medium text-purple-800">
// 														Total Participants
// 													</p>
// 													<p className="text-2xl font-bold text-purple-600">
// 														{allChallenges.reduce(
// 															(sum, challenge) =>
// 																sum + (challenge.participants || 0),
// 															0
// 														)}
// 													</p>
// 													<p className="text-xs text-purple-700">
// 														Across all challenges
// 													</p>
// 												</div>
// 											</div>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>
// 						</div>
// 					</Tabs>
// 				</CardContent>
// 			</Card>

// 			<WithdrawalOverview withdrawalStats={withdrawalStats} stats={stats} />

// 			<div className="grid gap-6 md:grid-cols-7">
// 				{/* User Ranks Distribution */}
// 				<Card className="col-span-3 dashboard-card shadow-sm">
// 					<CardHeader>
// 						<CardTitle>User Ranks Distribution</CardTitle>
// 						<CardDescription>
// 							Distribution of users by activity rank
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent>
// 						{rankStats.length > 0 ? (
// 							<div className="space-y-4">
// 								{rankStats.map((rankStat) => (
// 									<div key={rankStat.rank} className="space-y-2">
// 										<div className="flex items-center justify-between">
// 											<span className="text-sm font-medium">
// 												{rankStat.rank === "UNRANKED"
// 													? "Unranked"
// 													: rankStat.rank.replace("_", " ")}
// 											</span>
// 											<span className="text-sm text-muted-foreground">
// 												{formatNumber(rankStat.count)} users (
// 												{rankStat.percentage}%)
// 											</span>
// 										</div>
// 										<Progress value={rankStat.percentage} className="h-2" />
// 									</div>
// 								))}
// 							</div>
// 						) : (
// 							<div className="flex items-center justify-center h-[200px]">
// 								<p className="text-muted-foreground">No rank data available</p>
// 							</div>
// 						)}
// 					</CardContent>
// 				</Card>

// 				{/* Withdrawal Status */}
// 			</div>

// 			<div className="grid gap-6 md:grid-cols-2">
// 				{/* Recent Users */}
// 				<Card className="dashboard-card shadow-sm">
// 					<CardHeader className="flex flex-row items-center justify-between">
// 						<div>
// 							<CardTitle>Recent Users</CardTitle>
// 							<CardDescription>Latest user registrations</CardDescription>
// 						</div>
// 						<Button variant="outline" size="sm" asChild>
// 							<Link href="/dashboard/users">
// 								View All
// 								<ArrowUpRight className="ml-2 h-4 w-4" />
// 							</Link>
// 						</Button>
// 					</CardHeader>
// 					<CardContent>
// 						{recentUsers.length > 0 ? (
// 							<div className="space-y-4">
// 								{recentUsers.map((user) => (
// 									<div
// 										key={user.id}
// 										className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
// 										<div className="flex-1">
// 											<p className="font-medium">{user.name}</p>
// 											<p className="text-xs text-muted-foreground">
// 												{user.email || user.phone}
// 											</p>
// 											<div className="flex items-center gap-2 mt-1">
// 												<span
// 													className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
// 														user.isProfileCompleted
// 															? "bg-green-100 text-green-800"
// 															: "bg-yellow-100 text-yellow-800"
// 													}`}>
// 													{user.isProfileCompleted ? "Complete" : "Incomplete"}
// 												</span>
// 												<span className="text-xs text-muted-foreground">
// 													{formatNumber(user.walletBalance)} points
// 												</span>
// 											</div>
// 										</div>
// 										<div className="text-right">
// 											<p className="text-xs text-muted-foreground">
// 												{formatDate(user.createdAt)}
// 											</p>
// 											<Button variant="outline" size="sm" asChild>
// 												<Link href={`/dashboard/users/${user.id}`}>View</Link>
// 											</Button>
// 										</div>
// 									</div>
// 								))}
// 							</div>
// 						) : (
// 							<div className="flex items-center justify-center h-[200px]">
// 								<p className="text-muted-foreground">No recent users</p>
// 							</div>
// 						)}
// 					</CardContent>
// 				</Card>

// 				{/* Recent Transactions */}
// 				<Card className="dashboard-card shadow-sm">
// 					<CardHeader className="flex flex-row items-center justify-between">
// 						<div>
// 							<CardTitle>Recent Transactions</CardTitle>
// 							<CardDescription>Latest point transactions</CardDescription>
// 						</div>
// 						<Button variant="outline" size="sm" asChild>
// 							<Link href="/dashboard/transactions">
// 								View All
// 								<ArrowUpRight className="ml-2 h-4 w-4" />
// 							</Link>
// 						</Button>
// 					</CardHeader>
// 					<CardContent>
// 						{recentTransactions.length > 0 ? (
// 							<div className="space-y-4">
// 								{recentTransactions.map((transaction) => (
// 									<div
// 										key={transaction.id}
// 										className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
// 										<div className="flex-1">
// 											<p className="font-medium">
// 												{transaction.user?.name || "Unknown User"}
// 											</p>
// 											<p className="text-xs text-muted-foreground">
// 												{transaction.description || transaction.transactionType}
// 											</p>
// 											<p className="text-xs text-muted-foreground mt-1">
// 												{transaction.transactionType}
// 											</p>
// 										</div>
// 										<div className="text-right">
// 											<p
// 												className={`font-medium ${
// 													transaction.amount > 0
// 														? "text-green-600"
// 														: "text-red-600"
// 												}`}>
// 												{transaction.amount > 0 ? "+" : ""}
// 												{formatNumber(transaction.amount)}{" "}
// 												{transaction.amountType}
// 											</p>
// 											<p className="text-xs text-muted-foreground">
// 												{formatDate(transaction.createdAt)}
// 											</p>
// 										</div>
// 									</div>
// 								))}
// 							</div>
// 						) : (
// 							<div className="flex items-center justify-center h-[200px]">
// 								<p className="text-muted-foreground">No recent transactions</p>
// 							</div>
// 						)}
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Quick Actions */}
// 			<Card className="dashboard-card shadow-sm">
// 				<CardHeader>
// 					<CardTitle>Quick Actions</CardTitle>
// 					<CardDescription>Common administrative tasks</CardDescription>
// 				</CardHeader>
// 				<CardContent>
// 					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// 						<Button
// 							className="h-20 flex-col gap-2 bg-app-primary hover:bg-app-primary/90"
// 							asChild>
// 							<Link href="/dashboard/users/new">
// 								<UserPlus className="h-6 w-6" />
// 								Add New User
// 							</Link>
// 						</Button>

// 						<Button variant="outline" className="h-20 flex-col gap-2" asChild>
// 							<Link href="/dashboard/challenges">
// 								<Trophy className="h-6 w-6" />
// 								Manage Challenges
// 							</Link>
// 						</Button>

// 						<Button variant="outline" className="h-20 flex-col gap-2" asChild>
// 							<Link href="/dashboard/withdrawals">
// 								<CreditCard className="h-6 w-6" />
// 								Review Withdrawals
// 							</Link>
// 						</Button>

// 						<Button variant="outline" className="h-20 flex-col gap-2" asChild>
// 							<Link href="/dashboard/transactions">
// 								<Activity className="h-6 w-6" />
// 								View Transactions
// 							</Link>
// 						</Button>
// 					</div>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }
