"use client";

import { useEffect, useState } from "react";
import {
	Activity,
	Footprints,
	MapPin,
	Search,
	SlidersHorizontal,
	TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { subDays } from "date-fns";
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

import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Download,
	Eye,
	MoreHorizontal,
	RefreshCw,
	User,
	X,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { SheetFooter, SheetClose } from "@/components/ui/sheet";

// import { subDays } from "date-fns";
// import {

// 	Tooltip as RechartsTooltip,

// } from "recharts";
import { BEARER_TOKEN, API_URL } from "@/lib/config.json";
import Link from "next/link";

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
		profileImage?: string;
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

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}

interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	hasNext: boolean;
	hasPrev: boolean;
}

type FilterOption = {
	label: string;
	value: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ActivitiesPage() {
	const [activities, setActivities] = useState<WalkingActivity[]>([]);
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
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);

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
		fetchActivityStats();
	}, [currentPage, itemsPerPage, searchQuery, filters, activeTab]);

	useEffect(() => {
		fetchActivityAnalytics();
	}, [dateRange]);

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

	const buildApiUrl = (endpoint: string, params: Record<string, any> = {}) => {
		const url = new URL(`${API_URL}${endpoint}`);
		Object.entries(params).forEach(([key, value]) => {
			if (
				value !== undefined &&
				value !== null &&
				value !== "" &&
				value !== "all"
			) {
				if (Array.isArray(value) && value.length > 0) {
					value.forEach((v) => url.searchParams.append(key, v));
				} else {
					url.searchParams.append(key, value.toString());
				}
			}
		});
		return url.toString();
	};

	const fetchActivities = async () => {
		try {
			setLoading(true);

			// Build query parameters
			const params: Record<string, any> = {
				page: currentPage,
				limit: itemsPerPage,
				search: searchQuery,
				sortBy: "createdAt",
				sortOrder: "desc",
			};

			// Add filters
			if (filters.activityType !== "all") {
				params.activityType = filters.activityType;
			}

			// Parse steps range
			if (filters.stepsRange !== "all") {
				if (filters.stepsRange.endsWith("+")) {
					params.stepsMin = Number.parseInt(
						filters.stepsRange.replace("+", "")
					);
				} else {
					const [min, max] = filters.stepsRange.split("-").map(Number);
					params.stepsMin = min;
					params.stepsMax = max;
				}
			}

			// Parse duration range
			if (filters.durationRange !== "all") {
				if (filters.durationRange.endsWith("+")) {
					params.durationMin = Number.parseInt(
						filters.durationRange.replace("+", "")
					);
				} else {
					const [min, max] = filters.durationRange.split("-").map(Number);
					params.durationMin = min;
					params.durationMax = max;
				}
			}

			// Add user ranks
			if (filters.userRank.length > 0) {
				params.userRanks = filters.userRank;
			}

			// Add date range
			if (dateRange.from) {
				params.startDate = dateRange.from.toISOString();
			}
			if (dateRange.to) {
				params.endDate = dateRange.to.toISOString();
			}

			const url = buildApiUrl("/api/admin/activities", params);

			const response = await fetch(url, {
				headers: {
					"Authorization": AUTH_TOKEN,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: ApiResponse<{
				activities: WalkingActivity[];
				pagination: PaginationInfo;
			}> = await response.json();

			if (result.success) {
				setActivities(result.data.activities);
				setPagination(result.data.pagination);
			} else {
				throw new Error(result.message || "Failed to fetch activities");
			}
		} catch (error) {
			console.error("Error fetching activities:", error);
			toast({
				title: "Error",
				description: "Failed to fetch activities. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchActivityStats = async () => {
		try {
			const params: Record<string, any> = {};

			if (dateRange.from) {
				params.startDate = dateRange.from.toISOString();
			}
			if (dateRange.to) {
				params.endDate = dateRange.to.toISOString();
			}

			const url = buildApiUrl("/api/admin/activities/stats", params);

			const response = await fetch(url, {
				headers: {
					"Authorization": AUTH_TOKEN,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: ApiResponse<ActivityStats> = await response.json();

			console.log("Activity Stats:", result);

			if (result.success) {
				setStats(result.data);
			} else {
				throw new Error(result.message || "Failed to fetch activity stats");
			}
		} catch (error) {
			console.error("Error fetching activity stats:", error);
			toast({
				title: "Error",
				description: "Failed to fetch activity statistics.",
				variant: "destructive",
			});
		}
	};

	const fetchActivityAnalytics = async () => {
		try {
			setAnalyticsLoading(true);

			const params: Record<string, any> = {
				period: dateFilterOption === "custom" ? "custom" : dateFilterOption,
			};

			if (dateRange.from) {
				params.startDate = dateRange.from.toISOString();
			}
			if (dateRange.to) {
				params.endDate = dateRange.to.toISOString();
			}

			const url = buildApiUrl("/api/admin/activities/analytics", params);

			const response = await fetch(url, {
				headers: {
					"Authorization": AUTH_TOKEN,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: ApiResponse<typeof analyticsData> = await response.json();

			if (result.success) {
				setAnalyticsData(result.data);
			} else {
				throw new Error(result.message || "Failed to fetch activity analytics");
			}
		} catch (error) {
			console.error("Error fetching activity analytics:", error);
			toast({
				title: "Error",
				description: "Failed to fetch activity analytics.",
				variant: "destructive",
			});
		} finally {
			setAnalyticsLoading(false);
		}
	};

	const fetchActivityById = async (id: number) => {
		try {
			const response = await fetch(`${API_URL}/api/admin/activities/${id}`, {
				headers: {
					"Authorization": AUTH_TOKEN,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: ApiResponse<WalkingActivity> = await response.json();

			if (result.success) {
				return result.data;
			} else {
				throw new Error(result.message || "Failed to fetch activity details");
			}
		} catch (error) {
			console.error("Error fetching activity details:", error);
			toast({
				title: "Error",
				description: "Failed to fetch activity details.",
				variant: "destructive",
			});
			return null;
		}
	};

	// Apply tab filters to activities
	const getFilteredActivitiesByTab = (activities: WalkingActivity[]) => {
		switch (activeTab) {
			case "walking":
				return activities.filter(
					(activity) => activity.activityType === "WALKING"
				);
			case "running":
				return activities.filter(
					(activity) => activity.activityType === "RUNNING"
				);
			case "high-steps":
				return activities.filter((activity) => activity.steps >= 10000);
			default:
				return activities;
		}
	};

	const filteredActivities = getFilteredActivitiesByTab(activities);

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

	const handleViewActivityDetails = async (activity: WalkingActivity) => {
		// Fetch detailed activity data
		const detailedActivity = await fetchActivityById(activity.id);
		if (detailedActivity) {
			setSelectedActivity(detailedActivity);
			setIsActivityDetailOpen(true);
		}
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
		setCurrentPage(1);
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

	if (loading && currentPage === 1) {
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
						{pagination?.totalCount || 0} total
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
								? Math.round(
										stats.totalCalories / Math.max(stats.totalActivities, 1)
								  )
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
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setCurrentPage(1);
									}}
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
												{/* onClick={handleApplyFilters} */}
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
										onClick={() => {
											setFilters((prev) => ({
												...prev,
												activityType: "all",
											}));
											setCurrentPage(1);
											fetchActivities();
										}}>
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
										onClick={() => {
											setFilters((prev) => ({
												...prev,
												stepsRange: "all",
											}));
											setCurrentPage(1);
											fetchActivities();
										}}>
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
										onClick={() => {
											setFilters((prev) => ({
												...prev,
												durationRange: "all",
											}));
											setCurrentPage(1);
											fetchActivities();
										}}>
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
										onClick={() => {
											setFilters((prev) => ({
												...prev,
												userRank: [],
											}));
											setCurrentPage(1);
											fetchActivities();
										}}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-8 px-2"
								onClick={() => {
									resetFilters();
									setCurrentPage(1);
									fetchActivities();
								}}>
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
