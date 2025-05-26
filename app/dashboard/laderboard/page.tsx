"use client";

import { useEffect, useState } from "react";
import {
	Trophy,
	Medal,
	Crown,
	Users,
	Target,
	Sparkles,
	BarChart3,
	RefreshCw,
	Timer,
	Star,
	Zap,
	Calendar,
	Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
	id: number;
	name: string;
	email: string;
	profileImage?: string;
}

interface LeaderboardEntry {
	id?: number;
	rank: number;
	user: User;
	points?: number;
	totalSteps: number;
	steps?: number;
	date?: string;
}

interface Challenge {
	id: number;
	name: string;
	stepsRequired: number;
}

interface LeaderboardStats {
	totalParticipants: number;
	totalSteps: number;
	averageSteps: number;
	topPerformer: string;
}

interface CountdownTimers {
	daily?: number;
	weekly?: number;
	monthly?: number;
	yearly?: number;
}

export default function LeaderboardPage() {
	const [activeTab, setActiveTab] = useState("global");
	const [globalLeaderboard, setGlobalLeaderboard] = useState<
		LeaderboardEntry[]
	>([]);
	const [challengeLeaderboard, setChallengeLeaderboard] = useState<
		LeaderboardEntry[]
	>([]);
	const [yearlyLeaderboard, setYearlyLeaderboard] = useState<
		LeaderboardEntry[]
	>([]);
	const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<
		LeaderboardEntry[]
	>([]);
	const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<
		LeaderboardEntry[]
	>([]);
	const [challenges, setChallenges] = useState<Challenge[]>([]);
	const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(
		null
	);
	const [countdowns, setCountdowns] = useState<CountdownTimers>({});
	const [stats, setStats] = useState<LeaderboardStats>({
		totalParticipants: 0,
		totalSteps: 0,
		averageSteps: 0,
		topPerformer: "",
	});
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [selectedChallenge, setSelectedChallenge] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>(
		new Date().getFullYear().toString()
	);
	const [selectedMonth, setSelectedMonth] = useState<string>(
		(new Date().getMonth() + 1).toString()
	);
	const [selectedWeek, setSelectedWeek] = useState<string>("");

	useEffect(() => {
		fetchInitialData();
		fetchCountdowns();
		const interval = setInterval(fetchCountdowns, 60000); // Update every minute
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (activeTab === "global") {
			fetchGlobalLeaderboard();
		} else if (activeTab === "challenge" && selectedChallenge) {
			fetchChallengeLeaderboard(selectedChallenge);
		} else if (activeTab === "yearly") {
			fetchYearlyLeaderboard(selectedYear);
		} else if (activeTab === "monthly") {
			fetchMonthlyLeaderboard(selectedMonth, selectedYear);
		} else if (activeTab === "weekly") {
			fetchWeeklyLeaderboard(selectedWeek, selectedYear);
		}
	}, [activeTab, selectedChallenge, selectedYear, selectedMonth, selectedWeek]);

	const fetchInitialData = async () => {
		try {
			setLoading(true);
			await Promise.all([
				fetchGlobalLeaderboard(),
				fetchChallenges(),
				fetchUserPosition(),
			]);
		} catch (error) {
			console.error("Error fetching initial data:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchGlobalLeaderboard = async () => {
		try {
			const response = await fetch("http://localhost:3001/api/leaderboard");
			const data = await response.json();

			if (response.ok) {
				setGlobalLeaderboard(data.leaderboard || []);
				calculateStats(data.leaderboard || []);
			}
		} catch (error) {
			console.error("Error fetching global leaderboard:", error);
		}
	};

	const fetchChallengeLeaderboard = async (challengeId: string) => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/leaderboard/challenge/${challengeId}`
			);
			const data = await response.json();

			console.log({
				data,
			});

			if (response.ok) {
				setChallengeLeaderboard(data.leaderboard || []);
			}
		} catch (error) {
			console.error("Error fetching challenge leaderboard:", error);
		}
	};

	const fetchYearlyLeaderboard = async (year: string) => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/leaderboard/yearly?year=${year}`
			);
			const data = await response.json();

			console.log({ data });

			if (response.ok) {
				setYearlyLeaderboard(data.leaderboard || []);
			}
		} catch (error) {
			console.error("Error fetching yearly leaderboard:", error);
		}
	};

	const fetchMonthlyLeaderboard = async (month: string, year: string) => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/leaderboard/monthly?month=${month}&year=${year}`
			);
			const data = await response.json();

			if (response.ok) {
				setMonthlyLeaderboard(data.leaderboard || []);
			}
		} catch (error) {
			console.error("Error fetching monthly leaderboard:", error);
		}
	};

	const fetchWeeklyLeaderboard = async (week: string, year: string) => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/leaderboard/weekly?week=${week}&year=${year}`
			);
			const data = await response.json();

			console.log({ weeklyData: data });

			if (response.ok) {
				setWeeklyLeaderboard(data.leaderboard || []);
			}
		} catch (error) {
			console.error("Error fetching weekly leaderboard:", error);
		}
	};

	const fetchChallenges = async () => {
		try {
			const response = await fetch(
				"http://localhost:3001/api/challenges/getChallenges"
			);
			const data = await response.json();

			if (response.ok) {
				setChallenges(data.challenges || []);
				if (data.challenges?.length > 0) {
					setSelectedChallenge(data.challenges[0].id.toString());
				}
			}
		} catch (error) {
			console.error("Error fetching challenges:", error);
		}
	};

	const fetchUserPosition = async () => {
		try {
			const response = await fetch(
				"http://localhost:3001/api/leaderboard/user-position",
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			const data = await response.json();

			if (response.ok) {
				setUserPosition(data.leaderboardEntry);
			}
		} catch (error) {
			console.error("Error fetching user position:", error);
		}
	};

	const fetchCountdowns = async () => {
		try {
			const response = await fetch(
				"http://localhost:3001/api/leaderboard/count"
			);
			const data = await response.json();

			if (response.ok) {
				setCountdowns(data);
			}
		} catch (error) {
			console.error("Error fetching countdowns:", error);
		}
	};

	const updateLeaderboard = async () => {
		try {
			setUpdating(true);
			const response = await fetch(
				"http://localhost:3001/api/leaderboard/update",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			if (response.ok) {
				await fetchGlobalLeaderboard();
				await fetchUserPosition();
			}
		} catch (error) {
			console.error("Error updating leaderboard:", error);
		} finally {
			setUpdating(false);
		}
	};

	const calculateStats = (leaderboard: LeaderboardEntry[]) => {
		if (leaderboard.length === 0) return;

		const totalSteps = leaderboard.reduce(
			(sum, entry) => sum + (entry.totalSteps || entry.steps || 0),
			0
		);
		const averageSteps = totalSteps / leaderboard.length;
		const topPerformer = leaderboard[0]?.user.name || "";

		setStats({
			totalParticipants: leaderboard.length,
			totalSteps,
			averageSteps,
			topPerformer,
		});
	};

	const formatSteps = (steps: number) => {
		return steps.toLocaleString();
	};

	const formatCountdown = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const getRankBadge = (rank: number) => {
		switch (rank) {
			case 1:
				return (
					<div className="flex items-center gap-2">
						<Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg border-0 px-3 py-1">
							<Crown className="w-4 h-4 mr-1" />
							1st
						</Badge>
						<Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
					</div>
				);
			case 2:
				return (
					<Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white border-0 px-3 py-1">
						<Medal className="w-4 h-4 mr-1" />
						2nd
					</Badge>
				);
			case 3:
				return (
					<Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-0 px-3 py-1">
						<Medal className="w-4 h-4 mr-1" />
						3rd
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="px-3 py-1 font-medium">
						#{rank}
					</Badge>
				);
		}
	};

	const getProgressColor = (rank: number) => {
		if (rank === 1) return "bg-yellow-500";
		if (rank === 2) return "bg-gray-400";
		if (rank === 3) return "bg-orange-500";
		if (rank <= 10) return "bg-blue-500";
		return "bg-gray-300";
	};

	const getCurrentLeaderboard = () => {
		switch (activeTab) {
			case "global":
				return globalLeaderboard;
			case "challenge":
				return challengeLeaderboard;
			case "yearly":
				return yearlyLeaderboard;
			case "monthly":
				return monthlyLeaderboard;
			case "weekly":
				return weeklyLeaderboard;
			default:
				return [];
		}
	};

	const getYearOptions = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = currentYear; i >= currentYear - 5; i--) {
			years.push(i.toString());
		}
		return years;
	};

	const getMonthOptions = () => {
		return [
			{ value: "1", label: "January" },
			{ value: "2", label: "February" },
			{ value: "3", label: "March" },
			{ value: "4", label: "April" },
			{ value: "5", label: "May" },
			{ value: "6", label: "June" },
			{ value: "7", label: "July" },
			{ value: "8", label: "August" },
			{ value: "9", label: "September" },
			{ value: "10", label: "October" },
			{ value: "11", label: "November" },
			{ value: "12", label: "December" },
		];
	};

	const getWeekOptions = () => {
		const weeks = [];
		for (let i = 1; i <= 52; i++) {
			weeks.push({ value: i.toString(), label: `Week ${i}` });
		}
		return weeks;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
					<p className="text-muted-foreground text-lg">
						Loading leaderboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{/* Enhanced Header */}
			<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white">
				<div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
				<div className="relative flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
							<Trophy className="h-8 w-8 text-yellow-300" />
						</div>
						<div>
							<h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
							<p className="text-blue-100 text-lg">
								Track performance and compete with other participants
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<Button
							variant="secondary"
							onClick={updateLeaderboard}
							disabled={updating}
							className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
							{updating ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
									Updating...
								</>
							) : (
								<>
									<RefreshCw className="w-4 h-4 mr-2" />
									Update Rankings
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Enhanced User Position Alert */}
			{userPosition && (
				<Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
					<div className="rounded-full bg-blue-100 p-2 w-fit">
						<Trophy className="h-4 w-4 text-blue-600" />
					</div>
					<AlertDescription className="text-blue-800 font-medium">
						🎯 Your current position: <strong>#{userPosition.rank}</strong> with{" "}
						<strong>{userPosition.points} points</strong> - Keep climbing!
					</AlertDescription>
				</Alert>
			)}

			{/* Enhanced Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
							Total Participants
						</CardTitle>
						<div className="rounded-full bg-blue-500 p-2">
							<Users className="h-4 w-4 text-white" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
							{stats.totalParticipants}
						</div>
						<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
							Active competitors
						</p>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
							Total Steps
						</CardTitle>
						<div className="rounded-full bg-green-500 p-2">
							<Target className="h-4 w-4 text-white" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-900 dark:text-green-100">
							{formatSteps(stats.totalSteps)}
						</div>
						<p className="text-xs text-green-600 dark:text-green-400 mt-1">
							Steps recorded
						</p>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
							Average Steps
						</CardTitle>
						<div className="rounded-full bg-orange-500 p-2">
							<BarChart3 className="h-4 w-4 text-white" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
							{formatSteps(Math.round(stats.averageSteps))}
						</div>
						<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
							Per participant
						</p>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
							Top Performer
						</CardTitle>
						<div className="rounded-full bg-purple-500 p-2">
							<Crown className="h-4 w-4 text-white" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold text-purple-900 dark:text-purple-100 truncate">
							{stats.topPerformer || "N/A"}
						</div>
						<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
							Current leader
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Countdown Timers */}
			{Object.keys(countdowns).length > 0 && (
				<Card className="border-0 shadow-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-3">
							<div className="rounded-full bg-indigo-100 p-2">
								<Timer className="w-5 h-5 text-indigo-600" />
							</div>
							Next Leaderboard Updates
						</CardTitle>
						<CardDescription>
							Automatic refresh times for different leaderboard periods
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{countdowns.daily !== undefined && (
								<div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
									<Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
									<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
										Daily Reset
									</p>
									<p className="text-xl font-mono font-bold text-blue-900 dark:text-blue-100">
										{formatCountdown(countdowns.daily)}
									</p>
								</div>
							)}
							{countdowns.weekly !== undefined && (
								<div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
									<Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
									<p className="text-sm font-medium text-green-700 dark:text-green-300">
										Weekly Reset
									</p>
									<p className="text-xl font-mono font-bold text-green-900 dark:text-green-100">
										{formatCountdown(countdowns.weekly)}
									</p>
								</div>
							)}
							{countdowns.monthly !== undefined && (
								<div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
									<Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
									<p className="text-sm font-medium text-orange-700 dark:text-orange-300">
										Monthly Reset
									</p>
									<p className="text-xl font-mono font-bold text-orange-900 dark:text-orange-100">
										{formatCountdown(countdowns.monthly)}
									</p>
								</div>
							)}
							{countdowns.yearly !== undefined && (
								<div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
									<Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
									<p className="text-sm font-medium text-purple-700 dark:text-purple-300">
										Yearly Reset
									</p>
									<p className="text-xl font-mono font-bold text-purple-900 dark:text-purple-100">
										{formatCountdown(countdowns.yearly)}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Enhanced Main Leaderboard */}
			<Card className="border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-3">
						<div className="rounded-full bg-yellow-100 p-2">
							<Trophy className="w-5 h-5 text-yellow-600" />
						</div>
						Leaderboard Rankings
					</CardTitle>
					<CardDescription>
						View rankings across different time periods and challenges
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-6">
						<TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
							<TabsTrigger
								value="global"
								className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
								🌍 Global
							</TabsTrigger>
							<TabsTrigger
								value="challenge"
								className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
								🏆 Challenge
							</TabsTrigger>
							<TabsTrigger
								value="yearly"
								className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
								📅 Yearly
							</TabsTrigger>
							<TabsTrigger
								value="monthly"
								className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
								📊 Monthly
							</TabsTrigger>
							<TabsTrigger
								value="weekly"
								className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
								⚡ Weekly
							</TabsTrigger>
						</TabsList>

						{/* Enhanced Filters */}
						<div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Filters:
								</span>
							</div>

							{activeTab === "challenge" && (
								<Select
									value={selectedChallenge}
									onValueChange={setSelectedChallenge}>
									<SelectTrigger className="w-[250px] bg-white dark:bg-gray-800">
										<SelectValue placeholder="Select challenge" />
									</SelectTrigger>
									<SelectContent>
										{challenges.map((challenge) => (
											<SelectItem
												key={challenge.id}
												value={challenge.id.toString()}>
												{challenge.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}

							{(activeTab === "yearly" ||
								activeTab === "monthly" ||
								activeTab === "weekly") && (
								<Select value={selectedYear} onValueChange={setSelectedYear}>
									<SelectTrigger className="w-[120px] bg-white dark:bg-gray-800">
										<SelectValue placeholder="Year" />
									</SelectTrigger>
									<SelectContent>
										{getYearOptions().map((year) => (
											<SelectItem key={year} value={year}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}

							{activeTab === "monthly" && (
								<Select value={selectedMonth} onValueChange={setSelectedMonth}>
									<SelectTrigger className="w-[140px] bg-white dark:bg-gray-800">
										<SelectValue placeholder="Month" />
									</SelectTrigger>
									<SelectContent>
										{getMonthOptions().map((month) => (
											<SelectItem key={month.value} value={month.value}>
												{month.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}

							{activeTab === "weekly" && (
								<Select value={selectedWeek} onValueChange={setSelectedWeek}>
									<SelectTrigger className="w-[120px] bg-white dark:bg-gray-800">
										<SelectValue placeholder="Week" />
									</SelectTrigger>
									<SelectContent>
										{getWeekOptions().map((week) => (
											<SelectItem key={week.value} value={week.value}>
												{week.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						<TabsContent value={activeTab} className="space-y-4">
							{getCurrentLeaderboard().length === 0 ? (
								<div className="text-center py-16">
									<div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 w-fit mx-auto mb-4">
										<Trophy className="h-12 w-12 text-gray-400 mx-auto" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										No Rankings Available
									</h3>
									<p className="text-gray-500 dark:text-gray-400">
										No leaderboard data available for the selected period
									</p>
								</div>
							) : (
								<div className="rounded-lg border overflow-hidden">
									<Table>
										<TableHeader className="bg-gray-50 dark:bg-gray-900">
											<TableRow>
												<TableHead className="font-semibold">Rank</TableHead>
												<TableHead className="font-semibold">
													Participant
												</TableHead>
												<TableHead className="font-semibold">Steps</TableHead>
												{activeTab === "global" && (
													<TableHead className="font-semibold">
														Points
													</TableHead>
												)}
												<TableHead className="font-semibold">
													Progress
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{getCurrentLeaderboard().map((entry, index) => {
												const isTopThree = entry.rank <= 3;
												const steps = entry.totalSteps || entry.steps || 0;
												const maxSteps = Math.max(
													...getCurrentLeaderboard().map(
														(e) => e.totalSteps || e.steps || 0
													)
												);
												const progressPercentage =
													maxSteps > 0 ? (steps / maxSteps) * 100 : 0;

												return (
													<TableRow
														key={entry.user.id}
														className={`hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
															isTopThree
																? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-l-4 border-l-yellow-400"
																: ""
														}`}>
														<TableCell className="py-4">
															{getRankBadge(entry.rank)}
														</TableCell>
														<TableCell className="py-4">
															<div className="flex items-center gap-4">
																<div className="relative">
																	<Avatar
																		className={`h-12 w-12 border-2 ${
																			isTopThree
																				? "border-yellow-400 shadow-lg"
																				: "border-gray-200"
																		}`}>
																		<AvatarImage
																			src={
																				entry.user.profileImage ||
																				"/placeholder.svg?height=48&width=48" ||
																				"/placeholder.svg"
																			}
																		/>
																		<AvatarFallback
																			className={`text-sm font-semibold ${
																				isTopThree
																					? "bg-yellow-100 text-yellow-800"
																					: "bg-gray-100 text-gray-600"
																			}`}>
																			{entry.user.name
																				.split(" ")
																				.map((n) => n[0])
																				.join("")
																				.toUpperCase()}
																		</AvatarFallback>
																	</Avatar>
																	{entry.rank === 1 && (
																		<div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 p-1">
																			<Crown className="w-4 h-4 text-white" />
																		</div>
																	)}
																	{entry.rank === 2 && (
																		<div className="absolute -top-2 -right-2 rounded-full bg-gray-400 p-1">
																			<Medal className="w-4 h-4 text-white" />
																		</div>
																	)}
																	{entry.rank === 3 && (
																		<div className="absolute -top-2 -right-2 rounded-full bg-orange-400 p-1">
																			<Medal className="w-4 h-4 text-white" />
																		</div>
																	)}
																</div>
																<div>
																	<p
																		className={`font-semibold ${
																			isTopThree
																				? "text-yellow-800 dark:text-yellow-200"
																				: "text-gray-900 dark:text-gray-100"
																		}`}>
																		{entry.user.name}
																		{entry.rank === 1 && (
																			<span className="ml-2 text-lg">👑</span>
																		)}
																		{entry.rank === 2 && (
																			<span className="ml-2 text-lg">🥈</span>
																		)}
																		{entry.rank === 3 && (
																			<span className="ml-2 text-lg">🥉</span>
																		)}
																	</p>
																	<p className="text-sm text-gray-500 dark:text-gray-400">
																		{entry.user.email}
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell className="py-4">
															<div className="flex items-center gap-2">
																<Zap className="w-4 h-4 text-blue-500" />
																<span className="font-semibold text-lg">
																	{formatSteps(steps)}
																</span>
															</div>
														</TableCell>
														{activeTab === "global" && (
															<TableCell className="py-4">
																<div className="flex items-center gap-2">
																	<Star className="w-4 h-4 text-yellow-500" />
																	<span className="font-semibold">
																		{entry.points || 0}
																	</span>
																</div>
															</TableCell>
														)}
														<TableCell className="py-4">
															<div className="space-y-2 min-w-[120px]">
																<div className="flex justify-between text-sm">
																	<span className="font-medium">
																		{progressPercentage.toFixed(1)}%
																	</span>
																</div>
																<Progress
																	value={progressPercentage}
																	className={`h-3 ${
																		isTopThree ? "bg-yellow-100" : "bg-gray-100"
																	}`}
																/>
															</div>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
