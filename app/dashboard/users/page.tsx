"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Bell,
	ChevronLeft,
	ChevronRight,
	Download,
	MoreHorizontal,
	RefreshCw,
	Search,
	SlidersHorizontal,
	UserPlus,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { BEARER_TOKEN, API_URL } from "@/lib/config.json";
import Image from "next/image";

interface User {
	id: number;
	name: string;
	email: string;
	phone?: string;
	createdAt: string;
	walletBalance: number;
	roles: string[];
	rank?: string;
	isProfileCompleted: boolean;
}

// Filter types
type FilterOption = {
	label: string;
	value: string;
};

type FilterState = {
	rank: string[];
	profileStatus: string;
	pointsRange: string;
	joinedDate: string;
};

export default function UsersPage() {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
	const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState("");
	const [isSendingNotification, setIsSendingNotification] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [activeTab, setActiveTab] = useState("all");
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
	const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(
		null
	);
	const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

	// Filter states
	const [filters, setFilters] = useState<FilterState>({
		rank: [],
		profileStatus: "all",
		pointsRange: "all",
		joinedDate: "all",
	});

	// Filter options
	const rankOptions: FilterOption[] = [
		{ label: "Beginner", value: "BEGINNER" },
		{ label: "Walker", value: "WALKER" },
		{ label: "Active Walker", value: "ACTIVE_WALKER" },
		{ label: "Pro Walker", value: "PRO_WALKER" },
		{ label: "Master Walker", value: "MASTER_WALKER" },
		{ label: "Elite Walker", value: "ELITE_WALKER" },
	];

	const profileStatusOptions: FilterOption[] = [
		{ label: "All", value: "all" },
		{ label: "Complete", value: "complete" },
		{ label: "Incomplete", value: "incomplete" },
	];

	const pointsRangeOptions: FilterOption[] = [
		{ label: "All", value: "all" },
		{ label: "0-1000", value: "0-1000" },
		{ label: "1001-5000", value: "1001-5000" },
		{ label: "5001-10000", value: "5001-10000" },
		{ label: "10000+", value: "10000+" },
	];

	const joinedDateOptions: FilterOption[] = [
		{ label: "All Time", value: "all" },
		{ label: "Last 7 Days", value: "7days" },
		{ label: "Last 30 Days", value: "30days" },
		{ label: "Last 90 Days", value: "90days" },
		{ label: "This Year", value: "thisYear" },
	];

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/api/admin/users`, {
				headers: {
					Authorization: `Bearer ${BEARER_TOKEN}`,
				},
			});
			const data = await response.json();

			if (data.users) {
				setUsers(data.users);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toast({
				title: "Error",
				description: "Failed to fetch users. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Apply filters to users
	const applyFilters = (user: User) => {
		// Filter by rank
		if (filters.rank.length > 0 && !filters.rank.includes(user.rank || "")) {
			return false;
		}

		// Filter by profile status
		if (filters.profileStatus === "complete" && !user.isProfileCompleted) {
			return false;
		}
		if (filters.profileStatus === "incomplete" && user.isProfileCompleted) {
			return false;
		}

		// Filter by points range
		if (filters.pointsRange !== "all") {
			const [min, max] = filters.pointsRange.split("-").map(Number);
			if (filters.pointsRange.endsWith("+")) {
				const minPoints = Number.parseInt(filters.pointsRange.replace("+", ""));
				if (user.walletBalance < minPoints) return false;
			} else if (user.walletBalance < min || user.walletBalance > max) {
				return false;
			}
		}

		// Filter by joined date
		if (filters.joinedDate !== "all") {
			const userDate = new Date(user.createdAt);
			const now = new Date();

			if (filters.joinedDate === "7days") {
				const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
				if (userDate < sevenDaysAgo) return false;
			} else if (filters.joinedDate === "30days") {
				const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
				if (userDate < thirtyDaysAgo) return false;
			} else if (filters.joinedDate === "90days") {
				const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
				if (userDate < ninetyDaysAgo) return false;
			} else if (filters.joinedDate === "thisYear") {
				const thisYear = new Date(now.getFullYear(), 0, 1);
				if (userDate < thisYear) return false;
			}
		}

		return true;
	};

	// Filter users based on search query and filters
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(user.phone && user.phone.includes(searchQuery)) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesTab =
			activeTab === "all" ||
			(activeTab === "complete" && user.isProfileCompleted) ||
			(activeTab === "incomplete" && !user.isProfileCompleted);

		return matchesSearch && matchesTab && applyFilters(user);
	});

	// Pagination
	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedUsers = filteredUsers.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Helper function to get rank display class
	const getRankClass = (rank?: string) => {
		if (!rank) return "bg-gray-100 text-gray-800";

		switch (rank) {
			case "BEGINNER":
				return "bg-gray-100 text-gray-800";
			case "WALKER":
				return "bg-blue-100 text-blue-800";
			case "ACTIVE_WALKER":
				return "bg-green-100 text-green-800";
			case "PRO_WALKER":
				return "bg-purple-100 text-purple-800";
			case "MASTER_WALKER":
				return "bg-yellow-100 text-yellow-800";
			case "ELITE_WALKER":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const handleSelectAllUsers = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(paginatedUsers.map((user) => user.id));
		} else {
			setSelectedUsers([]);
		}
	};

	const handleSelectUser = (userId: number, checked: boolean) => {
		if (checked) {
			setSelectedUsers((prev) => [...prev, userId]);
		} else {
			setSelectedUsers((prev) => prev.filter((id) => id !== userId));
		}
	};

	const handleSendNotification = async () => {
		if (!notificationMessage.trim()) {
			toast({
				title: "Error",
				description: "Please enter a notification message",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsSendingNotification(true);

			// Here you would implement the actual API call to send notifications
			// Example:
			// const response = await fetch(`${API_URL}/api/admin/notifications/bulk", {
			//   method: "POST",
			//   headers: {
			//     "Content-Type": "application/json",
			//     Authorization: "Bearer your-token-here",
			//   },
			//   body: JSON.stringify({
			//     userIds: selectedUsers,
			//     message: notificationMessage,
			//   }),
			// });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Success",
				description: `Notification sent to ${selectedUsers.length} user${
					selectedUsers.length !== 1 ? "s" : ""
				}`,
			});

			setIsNotificationModalOpen(false);
			setNotificationMessage("");
		} catch (error) {
			console.error("Error sending notifications:", error);
			toast({
				title: "Error",
				description: "Failed to send notifications. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSendingNotification(false);
		}
	};

	const clearSelection = () => {
		setSelectedUsers([]);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Clear selection when changing pages
		setSelectedUsers([]);
	};

	const handleViewUserDetails = (user: User) => {
		setSelectedUserDetails(user);
		setIsUserDetailOpen(true);
	};

	const handleViewUserRouterDetails = (user: User) => {
		router.push(`users/${user.id}`);
		// setSelectedUserDetails(user);
		// setIsUserDetailOpen(true);
	};

	const handleExportUsers = () => {
		// In a real implementation, you would generate a CSV or Excel file
		toast({
			title: "Export Started",
			description: "Your user data export is being prepared.",
		});
	};

	const resetFilters = () => {
		setFilters({
			rank: [],
			profileStatus: "all",
			pointsRange: "all",
			joinedDate: "all",
		});
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.rank.length > 0) count++;
		if (filters.profileStatus !== "all") count++;
		if (filters.pointsRange !== "all") count++;
		if (filters.joinedDate !== "all") count++;
		return count;
	};

	const activeFiltersCount = getActiveFiltersCount();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">User Management</h1>
				<p className="text-muted-foreground">
					View and manage all users in the system
				</p>
			</div>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-app-primary"></div>
					<h2 className="text-xl font-semibold">Users</h2>
					<Badge variant="outline" className="ml-2">
						{users.length} total
					</Badge>
				</div>
				<div className="flex flex-wrap gap-2">
					{selectedUsers.length > 0 && (
						<Button
							variant="outline"
							className="flex items-center gap-1"
							onClick={() => setIsNotificationModalOpen(true)}>
							<Bell className="h-4 w-4 mr-1" />
							Send Notification ({selectedUsers.length})
						</Button>
					)}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" onClick={fetchUsers}>
									<RefreshCw className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Refresh users</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={handleExportUsers}>
									<Download className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Export users</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<Button className="bg-app-primary hover:bg-app-primary/90" asChild>
						<Link href="/dashboard/users/new">
							<UserPlus className="mr-2 h-4 w-4" />
							Add User
						</Link>
					</Button>
				</div>
			</div>

			<Card className="dashboard-card app-border shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div>
							<CardTitle>User Directory</CardTitle>
							<CardDescription>
								View and manage all registered users
							</CardDescription>
						</div>
						<Tabs
							defaultValue="all"
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full md:w-auto">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="all">All Users</TabsTrigger>
								<TabsTrigger value="complete">Complete Profile</TabsTrigger>
								<TabsTrigger value="incomplete">Incomplete Profile</TabsTrigger>
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
									placeholder="Search by name, email or phone..."
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
										<SheetTitle>Filter Users</SheetTitle>
										<SheetDescription>
											Apply filters to narrow down the user list
										</SheetDescription>
									</SheetHeader>
									<div className="py-6 space-y-6">
										<div className="space-y-2">
											<h3 className="text-sm font-medium">Rank</h3>
											<div className="grid grid-cols-2 gap-2">
												{rankOptions.map((option) => (
													<div
														key={option.value}
														className="flex items-center space-x-2">
														<Checkbox
															id={`rank-${option.value}`}
															checked={filters.rank.includes(option.value)}
															onCheckedChange={(checked) => {
																if (checked) {
																	setFilters((prev) => ({
																		...prev,
																		rank: [...prev.rank, option.value],
																	}));
																} else {
																	setFilters((prev) => ({
																		...prev,
																		rank: prev.rank.filter(
																			(r) => r !== option.value
																		),
																	}));
																}
															}}
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
										<div className="space-y-2">
											<h3 className="text-sm font-medium">Profile Status</h3>
											<Select
												value={filters.profileStatus}
												onValueChange={(value) =>
													setFilters((prev) => ({
														...prev,
														profileStatus: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													{profileStatusOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<h3 className="text-sm font-medium">Points Range</h3>
											<Select
												value={filters.pointsRange}
												onValueChange={(value) =>
													setFilters((prev) => ({
														...prev,
														pointsRange: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select points range" />
												</SelectTrigger>
												<SelectContent>
													{pointsRangeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<h3 className="text-sm font-medium">Joined Date</h3>
											<Select
												value={filters.joinedDate}
												onValueChange={(value) =>
													setFilters((prev) => ({ ...prev, joinedDate: value }))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select date range" />
												</SelectTrigger>
												<SelectContent>
													{joinedDateOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
							{selectedUsers.length > 0 && (
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{selectedUsers.length} selected
									</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 px-2"
										onClick={clearSelection}>
										<X className="h-4 w-4 mr-1" />
										Clear
									</Button>
								</div>
							)}
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
							{filters.rank.length > 0 && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Rank: {filters.rank.length} selected
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, rank: [] }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.profileStatus !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Profile:{" "}
									{filters.profileStatus === "complete"
										? "Complete"
										: "Incomplete"}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, profileStatus: "all" }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.pointsRange !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Points: {filters.pointsRange}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, pointsRange: "all" }))
										}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{filters.joinedDate !== "all" && (
								<Badge variant="secondary" className="flex items-center gap-1">
									Joined:{" "}
									{
										joinedDateOptions.find(
											(o) => o.value === filters.joinedDate
										)?.label
									}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1"
										onClick={() =>
											setFilters((prev) => ({ ...prev, joinedDate: "all" }))
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

					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="flex flex-col items-center gap-2">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
								<p className="text-sm text-muted-foreground">
									Loading users...
								</p>
							</div>
						</div>
					) : (
						<>
							<div className="rounded-md border overflow-hidden">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead className="w-[50px]">
												<Checkbox
													checked={
														paginatedUsers.length > 0 &&
														selectedUsers.length === paginatedUsers.length
													}
													onCheckedChange={handleSelectAllUsers}
													aria-label="Select all users"
												/>
											</TableHead>
											<TableHead>User</TableHead>
											<TableHead className="hidden md:table-cell">
												Phone
											</TableHead>
											<TableHead>Rank</TableHead>
											<TableHead>Profile</TableHead>
											<TableHead className="hidden md:table-cell">
												Points
											</TableHead>
											<TableHead className="hidden md:table-cell">
												Joined
											</TableHead>
											<TableHead className="w-[80px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{paginatedUsers.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={9}
													className="text-center h-24 text-muted-foreground">
													{searchQuery || activeFiltersCount > 0
														? "No users found matching your search criteria."
														: "No users found in the system."}
												</TableCell>
											</TableRow>
										) : (
											paginatedUsers.map((user) => (
												<TableRow
													key={user.id}
													className="hover:bg-muted/50 cursor-pointer"
													onClick={() => handleViewUserDetails(user)}>
													<TableCell onClick={(e) => e.stopPropagation()}>
														<Checkbox
															checked={selectedUsers.includes(user.id)}
															onCheckedChange={(checked) =>
																handleSelectUser(user.id, !!checked)
															}
															aria-label={`Select ${user.name}`}
														/>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-3">
															<Avatar className="h-9 w-9">
																<AvatarImage
																	src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
																	alt={user.name}
																/>
																<AvatarFallback>
																	{user.name.substring(0, 2).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<div className="flex flex-col">
																<span className="font-medium">{user.name}</span>
																<span className="text-xs text-muted-foreground">
																	{user.email}
																</span>
															</div>
														</div>
													</TableCell>
													<TableCell className="hidden md:table-cell">
														{user.phone || "Not provided"}
													</TableCell>
													<TableCell>
														{user.rank ? (
															<span
																className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRankClass(
																	user.rank
																)}`}>
																{user.rank.replace("_", " ")}
															</span>
														) : (
															<span className="text-muted-foreground text-xs">
																Not ranked
															</span>
														)}
													</TableCell>
													<TableCell>
														<span
															className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
																user.isProfileCompleted
																	? "bg-green-100 text-green-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}>
															{user.isProfileCompleted
																? "Complete"
																: "Incomplete"}
														</span>
													</TableCell>
													<TableCell className="hidden md:table-cell">
														{user.walletBalance.toLocaleString()} points
													</TableCell>
													<TableCell className="hidden md:table-cell">
														{formatDate(user.createdAt)}
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
																		handleViewUserRouterDetails(user)
																	}>
																	View details
																</DropdownMenuItem>
																<DropdownMenuItem asChild>
																	<Link
																		href={`/dashboard/users/${user.id}/edit`}>
																		Edit user
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => {
																		setSelectedUsers([user.id]);
																		setIsNotificationModalOpen(true);
																	}}>
																	Send notification
																</DropdownMenuItem>
																<DropdownMenuItem asChild>
																	<Link
																		href={`/dashboard/users/${user.id}/reset-password`}>
																		Reset password
																	</Link>
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
										{Math.min(startIndex + itemsPerPage, filteredUsers.length)}{" "}
										of {filteredUsers.length} users
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
											// Show pages around current page
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
													variant={
														currentPage === pageNum ? "default" : "outline"
													}
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
						</>
					)}
				</CardContent>
			</Card>

			{/* Notification Modal */}
			<Dialog
				open={isNotificationModalOpen}
				onOpenChange={setIsNotificationModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Send Notification</DialogTitle>
						<DialogDescription>
							Send a notification to {selectedUsers.length} selected user
							{selectedUsers.length !== 1 ? "s" : ""}.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Textarea
								placeholder="Enter your notification message here..."
								className="min-h-[120px]"
								value={notificationMessage}
								onChange={(e) => setNotificationMessage(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter className="sm:justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsNotificationModalOpen(false)}
							disabled={isSendingNotification}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSendNotification}
							disabled={isSendingNotification}
							className="bg-app-primary hover:bg-app-primary/90">
							{isSendingNotification ? (
								<>
									<div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
									Sending...
								</>
							) : (
								<>Send Notification</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* User Detail Sheet */}
			<Sheet open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
				<SheetContent className="sm:max-w-md overflow-y-auto">
					{selectedUserDetails && (
						<>
							<SheetHeader>
								<SheetTitle>User Details</SheetTitle>
								<SheetDescription>
									View detailed information about this user
								</SheetDescription>
							</SheetHeader>
							<div className="py-6">
								<div className="flex flex-col items-center mb-6">
									{/* <Avatar className="h-24 w-24 mb-4">
										<AvatarImage
											// src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUserDetails.name}`}
											src={`http://localhost:3001/uploads/1748547739574-profileImage.jpg`}
											alt={selectedUserDetails.name}
										/>
										<AvatarFallback>
											{selectedUserDetails.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar> */}
									<img
										src={`${API_URL}/uploads/1748547739574-profileImage.jpg`}
										alt={selectedUserDetails.name}
										className="h-24 w-24 rounded-full mb-4 object-cover"
									/>

									{/* <Image
										src={`http://localhost:3001/uploads/1748547739574-profileImage.jpg`}
										alt={selectedUserDetails.name}
										className="h-24 w-24 rounded-full mb-4 object-cover"
										width={96}
										height={96}
										loading="lazy"
										placeholder="blur"
										blurDataURL={`http://localhost:3001/uploads/1748547739574-profileImage.jpg`}
										quality={80}
										decoding="async"
										fetchPriority="high"
									/> */}
									<h3 className="text-xl font-semibold">
										{selectedUserDetails.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{selectedUserDetails.email}
									</p>
									{selectedUserDetails.phone && (
										<p className="text-sm">{selectedUserDetails.phone}</p>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<span className="text-sm text-muted-foreground">
											Points
										</span>
										<span className="text-xl font-semibold">
											{selectedUserDetails.walletBalance.toLocaleString()}
										</span>
									</div>
									<div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
										<span className="text-sm text-muted-foreground">
											Joined
										</span>
										<span className="text-xl font-semibold">
											{formatDate(selectedUserDetails.createdAt)}
										</span>
									</div>
								</div>

								<div className="space-y-6">
									<div>
										<h4 className="text-sm font-medium mb-2">Rank</h4>
										{selectedUserDetails.rank ? (
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ${getRankClass(
													selectedUserDetails.rank
												)}`}>
												{selectedUserDetails.rank.replace("_", " ")}
											</span>
										) : (
											<span className="text-muted-foreground">Not ranked</span>
										)}
									</div>

									<div>
										<h4 className="text-sm font-medium mb-2">Profile Status</h4>
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ${
												selectedUserDetails.isProfileCompleted
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{selectedUserDetails.isProfileCompleted
												? "Complete"
												: "Incomplete"}
										</span>
									</div>

									<div>
										<h4 className="text-sm font-medium mb-2">Roles</h4>
										<div className="flex flex-wrap gap-2">
											{selectedUserDetails.roles.map((role, index) => (
												<span
													key={index}
													className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary">
													{role}
												</span>
											))}
										</div>
									</div>
								</div>
							</div>
							<SheetFooter className="flex flex-col sm:flex-row gap-2">
								<Button
									variant="outline"
									className="w-full sm:w-auto"
									onClick={() => {
										setSelectedUsers([selectedUserDetails.id]);
										setIsNotificationModalOpen(true);
										setIsUserDetailOpen(false);
									}}>
									<Bell className="h-4 w-4 mr-2" />
									Send Notification
								</Button>
								<Button
									className="w-full sm:w-auto bg-app-primary hover:bg-app-primary/90"
									asChild>
									<Link
										href={`/dashboard/users/${selectedUserDetails.id}/edit`}>
										Edit User
									</Link>
								</Button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
