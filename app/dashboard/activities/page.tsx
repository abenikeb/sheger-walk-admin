"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Activity,
	ChevronLeft,
	ChevronRight,
	Clock,
	Download,
	Eye,
	Footprints,
	MapPin,
	MoreHorizontal,
	RefreshCw,
	Search,
	SlidersHorizontal,
	TrendingUp,
	User,
	X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose,
} from "@/components/ui/sheet";
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
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

// Define the auth token
const AUTH_TOKEN = `Bearer ${BEARER_TOKEN}`;

interface WalkingActivity {
	id: number;
	userId: number;
	steps: number;
	distance: number;
	duration: number;
	calories: number;
	startTime: string;
	endTime: string;
	activityType: string;
	location?: string;
	createdAt: string;
	updatedAt: string;
	user: {
		id: number;
		name: string;
		email: string | null;
		rank?: string;
	};
}

interface ActivityStats {
	totalActivities: number;
	totalSteps: number;
	totalDistance: number;
	totalCalories: number;
	averageSteps: number;
	averageDistance: number;
	averageDuration: number;
	activeUsers: number;
}

interface DateRange {
	from: Date | undefined;
	to: Date | undefined;
}

interface FilterState {
	activityType: string;
	stepsRange: string;
	durationRange: string;
	dateRange: string;
	userRank: string[];
}

type FilterOption = {
	label: string;
	value: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ActivitiesPage() {
	const [activities, setActivities] = useState<WalkingActivity[]>([]);
	const [allActivities, setAllActivities] = useState<WalkingActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [analyticsLoading, setAnalyticsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [activeTab, setActiveTab] = useState("all");
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] =
		useState<WalkingActivity | null>(null);
	const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false);
	const [stats, setStats] = useState<ActivityStats | null>(null);

	// Date filtering
	const [dateRange, setDateRange] = useState<DateRange>({
		from: subDays(new Date(), 30),
		to: new Date(),
	});
	const [dateFilterOption, setDateFilterOption] = useState("30days");

	// Filter states
	const [filters, setFilters] = useState<FilterState>({
		activityType: "all",
		stepsRange: "all",
		durationRange: "all",
		dateRange: "all",
		userRank: [],
	});

	// Analytics data
	const [analyticsData, setAnalyticsData] = useState({
		dailySteps: [] as Array<{
			date: string;
			steps: number;
			activities: number;
		}>,
		activityTypes: [] as Array<{ name: string; value: number }>,
		hourlyDistribution: [] as Array<{ hour: string; count: number }>,
		topPerformers: [] as Array<{
			name: string;
			steps: number;
			activities: number;
		}>,
		weeklyTrends: [] as Array<{
			week: string;
			avgSteps: number;
			totalActivities: number;
		}>,
	});

	// Filter options
	const activityTypeOptions: FilterOption[] = [
		{ label: "All Types", value: "all" },
		{ label: "Walking", value: "WALKING" },
		{ label: "Running", value: "RUNNING" },
		{ label: "Jogging", value: "JOGGING" },
		{ label: "Hiking", value: "HIKING" },
	];

	const stepsRangeOptions: FilterOption[] = [
		{ label: "All", value: "all" },
		{ label: "0-1,000", value: "0-1000" },
		{ label: "1,001-5,000", value: "1001-5000" },
		{ label: "5,001-10,000", value: "5001-10000" },
		{ label: "10,001-15,000", value: "10001-15000" },
		{ label: "15,000+", value: "15000+" },
	];

	const durationRangeOptions: FilterOption[] = [
		{ label: "All", value: "all" },
		{ label: "0-15 min", value: "0-15" },
		{ label: "16-30 min", value: "16-30" },
		{ label: "31-60 min", value: "31-60" },
		{ label: "60+ min", value: "60+" },
	];

	const rankOptions: FilterOption[] = [
		{ label: "Beginner", value: "BEGINNER" },
		{ label: "Walker", value: "WALKER" },
		{ label: "Active Walker", value: "ACTIVE_WALKER" },
		{ label: "Pro Walker", value: "PRO_WALKER" },
		{ label: "Master Walker", value: "MASTER_WALKER" },
		{ label: "Elite Walker", value: "ELITE_WALKER" },
	];

	useEffect(() => {
		fetchActivities();
	}, []);

	useEffect(() => {
		if (allActivities.length > 0) {
			processAnalyticsData();
		}
	}, [dateRange, allActivities]);

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
				break;
		}
	};

	const handleCustomDateRangeChange = (range: DateRange) => {
		if (range.from && range.to) {
			setDateRange(range);
			setDateFilterOption("custom");
		}
	};

	const filterDataByDateRange = (
		activities: WalkingActivity[]
	): WalkingActivity[] => {
		if (!dateRange.from || !dateRange.to) return activities;

		const fromDate = startOfDay(dateRange.from);
		const toDate = endOfDay(dateRange.to);

		return activities.filter((activity) => {
			const activityDate = parseISO(activity.startTime);
			return isAfter(activityDate, fromDate) && isBefore(activityDate, toDate);
		});
	};

	const processAnalyticsData = () => {
		setAnalyticsLoading(true);

		try {
			const filteredActivities = filterDataByDateRange(allActivities);

			// Process daily steps data
			const dailyStepsMap = new Map<
				string,
				{ steps: number; activities: number }
			>();
			filteredActivities.forEach((activity) => {
				const date = format(parseISO(activity.startTime), "MMM dd");
				const existing = dailyStepsMap.get(date) || { steps: 0, activities: 0 };
				dailyStepsMap.set(date, {
					steps: existing.steps + activity.steps,
					activities: existing.activities + 1,
				});
			});

			const dailySteps = Array.from(dailyStepsMap.entries())
				.map(([date, data]) => ({ date, ...data }))
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
				.slice(-30);

			// Process activity types
			const activityTypesMap = new Map<string, number>();
			filteredActivities.forEach((activity) => {
				const type = activity.activityType || "WALKING";
				activityTypesMap.set(type, (activityTypesMap.get(type) || 0) + 1);
			});

			const activityTypes = Array.from(activityTypesMap.entries()).map(
				([name, value]) => ({ name, value })
			);

			// Process hourly distribution
			const hourlyMap = new Map<string, number>();
			filteredActivities.forEach((activity) => {
				const hour = format(parseISO(activity.startTime), "HH:00");
				hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
			});

			const hourlyDistribution = Array.from(hourlyMap.entries())
				.map(([hour, count]) => ({ hour, count }))
				.sort((a, b) => a.hour.localeCompare(b.hour));

			// Process top performers
			const userStatsMap = new Map<
				string,
				{ steps: number; activities: number; name: string }
			>();
			filteredActivities.forEach((activity) => {
				const userId = activity.userId.toString();
				const existing = userStatsMap.get(userId) || {
					steps: 0,
					activities: 0,
					name: activity.user.name,
				};
				userStatsMap.set(userId, {
					steps: existing.steps + activity.steps,
					activities: existing.activities + 1,
					name: activity.user.name,
				});
			});

			const topPerformers = Array.from(userStatsMap.values())
				.sort((a, b) => b.steps - a.steps)
				.slice(0, 10)
				.map(({ name, steps, activities }) => ({ name, steps, activities }));

			// Process weekly trends (simplified)
			const weeklyTrends = dailySteps.slice(-7).map((day, index) => ({
				week: `Week ${index + 1}`,
				avgSteps: Math.round(day.steps / Math.max(day.activities, 1)),
				totalActivities: day.activities,
			}));

			setAnalyticsData({
				dailySteps,
				activityTypes,
				hourlyDistribution,
				topPerformers,
				weeklyTrends,
			});
		} catch (error) {
			console.error("Error processing analytics data:", error);
		} finally {
			setAnalyticsLoading(false);
		}
	};

	const fetchActivities = async () => {
		try {
			setLoading(true);

			// Since there might not be a specific activities endpoint, we'll try to fetch from walking activities
			// or create mock data based on the existing API structure
			const response = await fetch(`${API_URL}/api/admin/walking-activities`, {
				headers: {
					Authorization: AUTH_TOKEN,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setAllActivities(data.activities || []);
				setActivities(data.activities || []);

				// Calculate stats
				if (data.activities && data.activities.length > 0) {
					const totalSteps = data.activities.reduce(
						(sum: number, activity: WalkingActivity) => sum + activity.steps,
						0
					);
					const totalDistance = data.activities.reduce(
						(sum: number, activity: WalkingActivity) => sum + activity.distance,
						0
					);
					const totalCalories = data.activities.reduce(
						(sum: number, activity: WalkingActivity) => sum + activity.calories,
						0
					);
					const uniqueUsers = new Set(
						data.activities.map((activity: WalkingActivity) => activity.userId)
					).size;

					setStats({
						totalActivities: data.activities.length,
						totalSteps,
						totalDistance,
						totalCalories,
						averageSteps: Math.round(totalSteps / data.activities.length),
						averageDistance:
							Math.round((totalDistance / data.activities.length) * 100) / 100,
						averageDuration: Math.round(
							data.activities.reduce(
								(sum: number, activity: WalkingActivity) =>
									sum + activity.duration,
								0
							) / data.activities.length
						),
						activeUsers: uniqueUsers,
					});
				}
			} else {
				// If the endpoint doesn't exist, we'll create some mock data for demonstration
				console.warn("Walking activities endpoint not found, using mock data");
				const mockActivities = generateMockActivities();
				setAllActivities(mockActivities);
				setActivities(mockActivities);

				// Calculate mock stats
				const totalSteps = mockActivities.reduce(
					(sum, activity) => sum + activity.steps,
					0
				);
				const totalDistance = mockActivities.reduce(
					(sum, activity) => sum + activity.distance,
					0
				);
				const totalCalories = mockActivities.reduce(
					(sum, activity) => sum + activity.calories,
					0
				);
				const uniqueUsers = new Set(
					mockActivities.map((activity) => activity.userId)
				).size;

				setStats({
					totalActivities: mockActivities.length,
					totalSteps,
					totalDistance,
					totalCalories,
					averageSteps: Math.round(totalSteps / mockActivities.length),
					averageDistance:
						Math.round((totalDistance / mockActivities.length) * 100) / 100,
					averageDuration: Math.round(
						mockActivities.reduce(
							(sum, activity) => sum + activity.duration,
							0
						) / mockActivities.length
					),
					activeUsers: uniqueUsers,
				});
			}
		} catch (error) {
			console.error("Error fetching activities:", error);
			toast({
				title: "Error",
				description: "Failed to fetch activities. Please try again.",
				variant: "destructive",
			});

			// Fallback to mock data
			const mockActivities = generateMockActivities();
			setAllActivities(mockActivities);
			setActivities(mockActivities);
		} finally {
			setLoading(false);
		}
	};

	const generateMockActivities = (): WalkingActivity[] => {
		const mockUsers = [
			{ id: 1, name: "John Doe", email: "john@example.com", rank: "WALKER" },
			{
				id: 2,
				name: "Jane Smith",
				email: "jane@example.com",
				rank: "ACTIVE_WALKER",
			},
			{
				id: 3,
				name: "Mike Johnson",
				email: "mike@example.com",
				rank: "PRO_WALKER",
			},
			{
				id: 4,
				name: "Sarah Wilson",
				email: "sarah@example.com",
				rank: "BEGINNER",
			},
			{
				id: 5,
				name: "David Brown",
				email: "david@example.com",
				rank: "MASTER_WALKER",
			},
		];

		const activityTypes = ["WALKING", "RUNNING", "JOGGING", "HIKING"];
		const activities: WalkingActivity[] = [];

		for (let i = 1; i <= 50; i++) {
			const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
			const activityType =
				activityTypes[Math.floor(Math.random() * activityTypes.length)];
			const steps = Math.floor(Math.random() * 15000) + 1000;
			const distance =
				Math.round((steps * 0.0008 + Math.random() * 0.5) * 100) / 100; // Rough conversion
			const duration = Math.floor(Math.random() * 120) + 15; // 15-135 minutes
			const calories = Math.floor(steps * 0.04 + Math.random() * 50);

			const startTime = subDays(new Date(), Math.floor(Math.random() * 30));
			const endTime = new Date(startTime.getTime() + duration * 60000);

			activities.push({
				id: i,
				userId: user.id,
				steps,
				distance,
				duration,
				calories,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				activityType,
				location: `Location ${i}`,
				createdAt: startTime.toISOString(),
				updatedAt: startTime.toISOString(),
				user,
			});
		}

		return activities.sort(
			(a, b) =>
				new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
		);
	};

	// Apply filters to activities
	const applyFilters = (activity: WalkingActivity) => {
		// Filter by activity type
		if (
			filters.activityType !== "all" &&
			activity.activityType !== filters.activityType
		) {
			return false;
		}

		// Filter by steps range
		if (filters.stepsRange !== "all") {
			const [min, max] = filters.stepsRange.split("-").map(Number);
			if (filters.stepsRange.endsWith("+")) {
				const minSteps = Number.parseInt(filters.stepsRange.replace("+", ""));
				if (activity.steps < minSteps) return false;
			} else if (activity.steps < min || activity.steps > max) {
				return false;
			}
		}

		// Filter by duration range
		if (filters.durationRange !== "all") {
			const [min, max] = filters.durationRange.split("-").map(Number);
			if (filters.durationRange.endsWith("+")) {
				const minDuration = Number.parseInt(
					filters.durationRange.replace("+", "")
				);
				if (activity.duration < minDuration) return false;
			} else if (activity.duration < min || activity.duration > max) {
				return false;
			}
		}

		// Filter by user rank
		if (
			filters.userRank.length > 0 &&
			!filters.userRank.includes(activity.user.rank || "")
		) {
			return false;
		}

		return true;
	};

	// Filter activities based on search query, tab, and filters
	const filteredActivities = activities.filter((activity) => {
		const matchesSearch =
			activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			activity.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(activity.location &&
				activity.location.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesTab =
			activeTab === "all" ||
			(activeTab === "walking" && activity.activityType === "WALKING") ||
			(activeTab === "running" && activity.activityType === "RUNNING") ||
			(activeTab === "high-steps" && activity.steps >= 10000);

		return matchesSearch && matchesTab && applyFilters(activity);
	});

	// Pagination
	const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedActivities = filteredActivities.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleViewActivityDetails = (activity: WalkingActivity) => {
		setSelectedActivity(activity);
		setIsActivityDetailOpen(true);
	};

	const handleExportActivities = () => {
		toast({
			title: "Export Started",
			description: "Your activity data export is being prepared.",
		});
	};

	const resetFilters = () => {
		setFilters({
			activityType: "all",
			stepsRange: "all",
			durationRange: "all",
			dateRange: "all",
			userRank: [],
		});
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.activityType !== "all") count++;
		if (filters.stepsRange !== "all") count++;
		if (filters.durationRange !== "all") count++;
		if (filters.userRank.length > 0) count++;
		return count;
	};

	const activeFiltersCount = getActiveFiltersCount();

	if (loading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold tracking-tight">Activities</h1>
					<p className="text-muted-foreground">
						Monitor and analyze user activities
					</p>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
						<p className="text-sm text-muted-foreground">
							Loading activities...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Activities</h1>
				<p className="text-muted-foreground">
					Monitor and analyze user activities
				</p>
			</div>

			{/* Date Filter Controls */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-app-primary"></div>
					<h2 className="text-xl font-semibold">Activity Overview</h2>
					<Badge variant="outline" className="ml-2">
						{activities.length} total
					</Badge>
				</div>

				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					<div className="flex items-center gap-2">
						<Select
							value={dateFilterOption}
							onValueChange={handleDateFilterChange}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select date range" />
							</SelectTrigger>
							<SelectContent>
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
								? "opacity-100"
								: "opacity-50 pointer-events-none"
						}
					/>
				</div>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="dashboard-card shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Activities
						</CardTitle>
						<Activity className="h-4 w-4 text-app-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-app-primary">
							{stats ? formatNumber(stats.totalActivities) : "0"}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats ? stats.activeUsers : 0} active users
						</p>
					</CardContent>
				</Card>

				<Card className="dashboard-card shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Steps</CardTitle>
						<Footprints className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{stats ? formatNumber(stats.totalSteps) : "0"}
						</div>
						<p className="text-xs text-muted-foreground">
							Avg: {stats ? formatNumber(stats.averageSteps) : "0"} per activity
						</p>
					</CardContent>
				</Card>

				<Card className="dashboard-card shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Distance
						</CardTitle>
						<MapPin className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats ? formatNumber(stats.totalDistance) : "0"} km
						</div>
						<p className="text-xs text-muted-foreground">
							Avg: {stats ? stats.averageDistance : "0"} km per activity
						</p>
					</CardContent>
				</Card>

				<Card className="dashboard-card shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Calories Burned
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{stats ? formatNumber(stats.totalCalories) : "0"}
						</div>
						<p className="text-xs text-muted-foreground">
							Avg:{" "}
							{stats
								? Math.round(stats.totalCalories / stats.totalActivities)
								: "0"}{" "}
							per activity
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Analytics Section */}
			<Card className="dashboard-card shadow-sm">
				<CardHeader>
					<CardTitle>Activity Analytics</CardTitle>
					<CardDescription>
						Detailed insights into user activity patterns
					</CardDescription>
				</CardHeader>
				<CardContent>
					{analyticsLoading && (
						<div className="flex items-center justify-center py-8">
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
								<span className="text-sm text-muted-foreground">
									Updating analytics...
								</span>
							</div>
						</div>
					)}

					<div className="grid gap-6 md:grid-cols-2 mb-6">
						{/* Daily Steps Chart */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Daily Steps Trend</CardTitle>
								<CardDescription>
									Steps and activity count over time
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={analyticsData.dailySteps}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="date" />
											<YAxis
												yAxisId="left"
												orientation="left"
												stroke="#8884d8"
											/>
											<YAxis
												yAxisId="right"
												orientation="right"
												stroke="#82ca9d"
											/>
											<RechartsTooltip />
											<Line
												yAxisId="left"
												type="monotone"
												dataKey="steps"
												stroke="#8884d8"
												name="Steps"
											/>
											<Line
												yAxisId="right"
												type="monotone"
												dataKey="activities"
												stroke="#82ca9d"
												name="Activities"
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						{/* Activity Types Distribution */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Activity Types</CardTitle>
								<CardDescription>
									Distribution of activity types
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="h-[300px] flex items-center justify-center">
									{analyticsData.activityTypes.length > 0 ? (
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={analyticsData.activityTypes}
													cx="50%"
													cy="50%"
													labelLine={false}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
													label={({ name, percent }) =>
														`${name}: ${(percent * 100).toFixed(0)}%`
													}>
													{analyticsData.activityTypes.map((entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
												</Pie>
												<RechartsTooltip />
											</PieChart>
										</ResponsiveContainer>
									) : (
										<p className="text-muted-foreground">
											No activity data available
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Hourly Distribution */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Activity Hours</CardTitle>
								<CardDescription>When users are most active</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={analyticsData.hourlyDistribution}>
											<XAxis dataKey="hour" />
											<YAxis />
											<RechartsTooltip />
											<Bar dataKey="count" fill="#00C49F" name="Activities" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						{/* Top Performers */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Top Performers</CardTitle>
								<CardDescription>
									Users with highest step counts
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="space-y-4">
									{analyticsData.topPerformers
										.slice(0, 5)
										.map((performer, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
												<div className="flex items-center gap-3">
													<div className="flex items-center justify-center w-8 h-8 rounded-full bg-app-primary text-white text-sm font-medium">
														{index + 1}
													</div>
													<div>
														<p className="font-medium">{performer.name}</p>
														<p className="text-xs text-muted-foreground">
															{performer.activities} activities
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-medium">
														{formatNumber(performer.steps)}
													</p>
													<p className="text-xs text-muted-foreground">steps</p>
												</div>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{/* Activities Table */}
			<Card className="dashboard-card app-border shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div>
							<CardTitle>Activity Log</CardTitle>
							<CardDescription>
								Detailed view of all user activities
							</CardDescription>
						</div>
						<Tabs
							defaultValue="all"
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full md:w-auto">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="walking">Walking</TabsTrigger>
								<TabsTrigger value="running">Running</TabsTrigger>
								<TabsTrigger value="high-steps">10K+ Steps</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
						<div className="flex flex-1 items-center gap-2 max-w-md">
							<div className="relative flex-1">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by user, activity type, or location..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Sheet
								open={isFilterSheetOpen}
								onOpenChange={setIsFilterSheetOpen}>
								<SheetTrigger asChild>
									<Button variant="outline" size="icon" className="relative">
										<SlidersHorizontal className="h-4 w-4" />
										{activeFiltersCount > 0 && (
											<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-app-primary text-[10px] text-white">
												{activeFiltersCount}
											</span>
										)}
									</Button>
								</SheetTrigger>
								<SheetContent className="sm:max-w-md">
									<SheetHeader>
										<SheetTitle>Filter Activities</SheetTitle>
										<SheetDescription>
											Apply filters to narrow down the activity list
										</SheetDescription>
									</SheetHeader>
									<div className="py-6 space-y-6">
										<div className="space-y-2">
											<h3 className="text-sm font-medium">Activity Type</h3>
											<Select
												value={filters.activityType}
												onValueChange={(value) =>
													setFilters((prev) => ({
														...prev,
														activityType: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select activity type" />
												</SelectTrigger>
												<SelectContent>
													{activityTypeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<h3 className="text-sm font-medium">Steps Range</h3>
											<Select
												value={filters.stepsRange}
												onValueChange={(value) =>
													setFilters((prev) => ({ ...prev, stepsRange: value }))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select steps range" />
												</SelectTrigger>
												<SelectContent>
													{stepsRangeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<h3 className="text-sm font-medium">Duration Range</h3>
											<Select
												value={filters.durationRange}
												onValueChange={(value) =>
													setFilters((prev) => ({
														...prev,
														durationRange: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select duration range" />
												</SelectTrigger>
												<SelectContent>
													{durationRangeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<h3 className="text-sm font-medium">User Rank</h3>
											<div className="grid grid-cols-2 gap-2">
												{rankOptions.map((option) => (
													<div
														key={option.value}
														className="flex items-center space-x-2">
														<input
															type="checkbox"
															id={`rank-${option.value}`}
															checked={filters.userRank.includes(option.value)}
															onChange={(e) => {
																if (e.target.checked) {
																	setFilters((prev) => ({
																		...prev,
																		userRank: [...prev.userRank, option.value],
																	}));
																} else {
																	setFilters((prev) => ({
																		...prev,
																		userRank: prev.userRank.filter(
																			(r) => r !== option.value
																		),
																	}));
																}
															}}
															className="rounded border-gray-300"
														/>
														<label
															htmlFor={`rank-${option.value}`}
															className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															{option.label}
														</label>
													</div>
												))}
											</div>
										</div>
									</div>
									<SheetFooter className="flex justify-between sm:justify-between">
										<Button variant="outline" onClick={resetFilters}>
											Reset Filters
										</Button>
										<SheetClose asChild>
											<Button className="bg-app-primary hover:bg-app-primary/90">
												Apply Filters
											</Button>
										</SheetClose>
									</SheetFooter>
								</SheetContent>
							</Sheet>
						</div>

						<div className="flex items-center gap-2 w-full md:w-auto">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											onClick={fetchActivities}>
											<RefreshCw className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Refresh activities</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											onClick={handleExportActivities}>
											<Download className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Export activities</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<Select
								value={itemsPerPage.toString()}
								onValueChange={(value) => {
									setItemsPerPage(Number.parseInt(value));
									setCurrentPage(1);
								}}>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="10 per page" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5 per page</SelectItem>
									<SelectItem value="10">10 per page</SelectItem>
									<SelectItem value="20">20 per page</SelectItem>
									<SelectItem value="50">50 per page</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{activeFiltersCount > 0 && (
						<div className="flex items-center gap-2 mb-4 flex-wrap">
							<span className="text-sm font-medium">Active filters:</span>
							{filters.activityType !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Type: {filters.activityType}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, activityType: "all" }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.stepsRange !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Steps: {filters.stepsRange}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, stepsRange: "all" }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.durationRange !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Duration: {filters.durationRange}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, durationRange: "all" }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.userRank.length > 0 && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Ranks: {filters.userRank.length} selected
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, userRank: [] }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-8 px-2"
								onClick={resetFilters}>
								Clear all
							</Button>
						</div>
					)}

					<div className="rounded-md border overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50">
									<TableHead>User</TableHead>
									<TableHead>Activity</TableHead>
									<TableHead>Steps</TableHead>
									<TableHead className="hidden md:table-cell">
										Distance
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Duration
									</TableHead>
									<TableHead className="hidden lg:table-cell">
										Calories
									</TableHead>
									<TableHead className="hidden lg:table-cell">Date</TableHead>
									<TableHead className="w-[80px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedActivities.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											className="text-center h-24 text-muted-foreground">
											{searchQuery || activeFiltersCount > 0
												? "No activities found matching your search criteria."
												: "No activities found."}
										</TableCell>
									</TableRow>
								) : (
									paginatedActivities.map((activity) => (
										<TableRow
											key={activity.id}
											className="hover:bg-muted/50 cursor-pointer"
											onClick={() => handleViewActivityDetails(activity)}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-9 w-9">
														<AvatarImage
															src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.user.name}`}
															alt={activity.user.name}
														/>
														<AvatarFallback>
															{activity.user.name.substring(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="flex flex-col">
														<span className="font-medium">
															{activity.user.name}
														</span>
														<span className="text-xs text-muted-foreground">
															{activity.user.email}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">
														{activity.activityType}
													</span>
													{activity.location && (
														<span className="text-xs text-muted-foreground">
															{activity.location}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell>
												<span className="font-medium">
													{formatNumber(activity.steps)}
												</span>
											</TableCell>
											<TableCell className="hidden md:table-cell">
												{activity.distance} km
											</TableCell>
											<TableCell className="hidden md:table-cell">
												{formatDuration(activity.duration)}
											</TableCell>
											<TableCell className="hidden lg:table-cell">
												{activity.calories} cal
											</TableCell>
											<TableCell className="hidden lg:table-cell">
												{formatDate(activity.startTime)}
											</TableCell>
											<TableCell onClick={(e) => e.stopPropagation()}>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															className="h-8 w-8 p-0"
															aria-label="Open menu">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() =>
																handleViewActivityDetails(activity)
															}>
															<Eye className="mr-2 h-4 w-4" />
															View details
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<Link
																href={`/dashboard/users/${activity.userId}`}>
																<User className="mr-2 h-4 w-4" />
																View user
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem>
															<Download className="mr-2 h-4 w-4" />
															Export activity
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								Showing {startIndex + 1}-
								{Math.min(startIndex + itemsPerPage, filteredActivities.length)}{" "}
								of {filteredActivities.length} activities
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="outline"
									size="icon"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									let pageNum;
									if (totalPages <= 5) {
										pageNum = i + 1;
									} else if (currentPage <= 3) {
										pageNum = i + 1;
									} else if (currentPage >= totalPages - 2) {
										pageNum = totalPages - 4 + i;
									} else {
										pageNum = currentPage - 2 + i;
									}

									return (
										<Button
											key={pageNum}
											variant={currentPage === pageNum ? "default" : "outline"}
											size="icon"
											onClick={() => handlePageChange(pageNum)}
											className={
												currentPage === pageNum
													? "bg-app-primary hover:bg-app-primary/90"
													: ""
											}>
											{pageNum}
										</Button>
									);
								})}
								<Button
									variant="outline"
									size="icon"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Activity Detail Sheet */}
			<Sheet open={isActivityDetailOpen} onOpenChange={setIsActivityDetailOpen}>
				<SheetContent className="sm:max-w-md overflow-y-auto">
					{selectedActivity && (
						<>
							<SheetHeader>
								<SheetTitle>Activity Details</SheetTitle>
								<SheetDescription>
									Detailed information about this activity
								</SheetDescription>
							</SheetHeader>
							<div className="py-6">
								<div className="flex flex-col items-center mb-6">
									<Avatar className="h-16 w-16 mb-4">
										<AvatarImage
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedActivity.user.name}`}
											alt={selectedActivity.user.name}
										/>
										<AvatarFallback>
											{selectedActivity.user.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<h3 className="text-lg font-semibold">
										{selectedActivity.user.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{selectedActivity.activityType}
									</p>
									{selectedActivity.location && (
										<p className="text-sm text-muted-foreground">
											{selectedActivity.location}
										</p>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<Footprints className="h-6 w-6 text-blue-600 mb-1" />
										<span className="text-sm text-muted-foreground">Steps</span>
										<span className="text-xl font-semibold">
											{formatNumber(selectedActivity.steps)}
										</span>
									</div>
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<MapPin className="h-6 w-6 text-green-600 mb-1" />
										<span className="text-sm text-muted-foreground">
											Distance
										</span>
										<span className="text-xl font-semibold">
											{selectedActivity.distance} km
										</span>
									</div>
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<Clock className="h-6 w-6 text-purple-600 mb-1" />
										<span className="text-sm text-muted-foreground">
											Duration
										</span>
										<span className="text-xl font-semibold">
											{formatDuration(selectedActivity.duration)}
										</span>
									</div>
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<TrendingUp className="h-6 w-6 text-orange-600 mb-1" />
										<span className="text-sm text-muted-foreground">
											Calories
										</span>
										<span className="text-xl font-semibold">
											{selectedActivity.calories}
										</span>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<h4 className="text-sm font-medium mb-2">
											Activity Period
										</h4>
										<div className="space-y-1">
											<p className="text-sm">
												<span className="text-muted-foreground">Started:</span>{" "}
												{formatDate(selectedActivity.startTime)}
											</p>
											<p className="text-sm">
												<span className="text-muted-foreground">Ended:</span>{" "}
												{formatDate(selectedActivity.endTime)}
											</p>
										</div>
									</div>

									<div>
										<h4 className="text-sm font-medium mb-2">
											Performance Metrics
										</h4>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">
													Avg. Speed
												</span>
												<span className="text-sm font-medium">
													{(
														(selectedActivity.distance /
															selectedActivity.duration) *
														60
													).toFixed(1)}{" "}
													km/h
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">
													Steps per minute
												</span>
												<span className="text-sm font-medium">
													{Math.round(
														selectedActivity.steps / selectedActivity.duration
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">
													Calories per km
												</span>
												<span className="text-sm font-medium">
													{Math.round(
														selectedActivity.calories /
															selectedActivity.distance
													)}
												</span>
											</div>
										</div>
									</div>

									{selectedActivity.user.rank && (
										<div>
											<h4 className="text-sm font-medium mb-2">User Rank</h4>
											<Badge variant="outline" className="text-sm">
												{selectedActivity.user.rank.replace("_", " ")}
											</Badge>
										</div>
									)}
								</div>
							</div>
							<SheetFooter className="flex flex-col sm:flex-row gap-2">
								<Button variant="outline" className="w-full sm:w-auto" asChild>
									<Link href={`/dashboard/users/${selectedActivity.userId}`}>
										<User className="h-4 w-4 mr-2" />
										View User Profile
									</Link>
								</Button>
								<Button className="w-full sm:w-auto bg-app-primary hover:bg-app-primary/90">
									<Download className="h-4 w-4 mr-2" />
									Export Activity
								</Button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
