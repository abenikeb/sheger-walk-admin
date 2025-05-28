"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	MoreHorizontal,
	Plus,
	Search,
	Filter,
	Users,
	Calendar,
	Trophy,
	DollarSign,
	Target,
	Clock,
	Activity,
	MapPin,
	Eye,
	Edit,
	Trash2,
	UserPlus,
	Zap,
	Gift,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreateChallengeDialog } from "./create-challenge-dialog";
import { ManageProvidersDialog } from "./manage-providers-dialog";
import { ManageRewardTypesDialog } from "./manage-reward-types-dialog";
import {BEARER_TOKEN, API_URL} from "@/lib/config.json";
interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
}

interface RewardType {
	id: number;
	name: string;
}

interface Reward {
	id: number;
	name: string;
	value: number;
	type: string;
}

interface Participant {
	userId: number;
	userName: string;
	userEmail: string;
	steps: number;
	joinDate: string;
	progress: number;
}

interface Challenge {
	id: number;
	name: string;
	provider: ChallengeProvider | null;
	joiningCost: number;
	startDate: string;
	endDate: string;
	expiryDate: string;
	image?: string;
	description: string;
	stepsRequired: number;
	minParticipants: number;
	reward: Reward;
	participants: number;
	participantsList: Participant[];
}

interface ChallengeStats {
	totalChallenges: number;
	activeChallenges: number;
	totalParticipants: number;
	totalRewardsDistributed: number;
}

export default function ChallengesPage() {
	const [challenges, setChallenges] = useState<Challenge[]>([]);
	const [providers, setProviders] = useState<ChallengeProvider[]>([]);
	const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
	const [stats, setStats] = useState<ChallengeStats>({
		totalChallenges: 0,
		activeChallenges: 0,
		totalParticipants: 0,
		totalRewardsDistributed: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "upcoming" | "completed"
	>("all");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [providersDialogOpen, setProvidersDialogOpen] = useState(false);
	const [rewardTypesDialogOpen, setRewardTypesDialogOpen] = useState(false);

	useEffect(() => {
		fetchChallenges();
		fetchProviders();
		fetchRewardTypes();
	}, []);

	const fetchChallenges = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${API_URL}/api/challenges/getChallenges`
			);
			const data = await response.json();

			if (response.ok) {
				setChallenges(data.challenges);
				calculateStats(data.challenges);
			} else {
				console.error("Failed to fetch challenges:", data.message);
			}
		} catch (error) {
			console.error("Error fetching challenges:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchProviders = async () => {
		try {
			const response = await fetch(
				`${API_URL}/api/challenges/providers`
			);
			const data = await response.json();

			if (response.ok) {
				setProviders(data);
			}
		} catch (error) {
			console.error("Error fetching providers:", error);
		}
	};

	const fetchRewardTypes = async () => {
		try {
			const response = await fetch(
				`${API_URL}/api/challenges/reward-types`
			);
			const data = await response.json();

			if (response.ok) {
				setRewardTypes(data);
			}
		} catch (error) {
			console.error("Error fetching reward types:", error);
		}
	};

	const calculateStats = (challengesList: Challenge[]) => {
		const now = new Date();
		const activeChallenges = challengesList.filter((challenge) => {
			const startDate = new Date(challenge.startDate);
			const endDate = new Date(challenge.endDate);
			return now >= startDate && now <= endDate;
		}).length;

		const totalParticipants = challengesList.reduce(
			(sum, challenge) => sum + challenge.participants,
			0
		);

		const totalRewardsDistributed = challengesList.reduce((sum, challenge) => {
			const completedParticipants = challenge.participantsList.filter(
				(p) => p.progress >= 100
			).length;
			return sum + completedParticipants * challenge.reward.value;
		}, 0);

		setStats({
			totalChallenges: challengesList.length,
			activeChallenges,
			totalParticipants,
			totalRewardsDistributed,
		});
	};

	const handleDeleteChallenge = async (challengeId: number) => {
		if (!confirm("Are you sure you want to delete this challenge?")) return;

		try {
			const response = await fetch(`/api/challenges/${challengeId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchChallenges();
			} else {
				console.error("Failed to delete challenge");
			}
		} catch (error) {
			console.error("Error deleting challenge:", error);
		}
	};

	const filteredChallenges = challenges.filter((challenge) => {
		const matchesSearch =
			challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			challenge.provider?.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		if (!matchesSearch) return false;

		if (statusFilter === "all") return true;

		const now = new Date();
		const startDate = new Date(challenge.startDate);
		const endDate = new Date(challenge.endDate);

		switch (statusFilter) {
			case "active":
				return now >= startDate && now <= endDate;
			case "upcoming":
				return startDate > now;
			case "completed":
				return endDate < now;
			default:
				return true;
		}
	});

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatus = (challenge: Challenge) => {
		const now = new Date();
		const startDate = new Date(challenge.startDate);
		const endDate = new Date(challenge.endDate);

		if (now >= startDate && now <= endDate) return "active";
		if (startDate > now) return "upcoming";
		return "completed";
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50">
						<div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
						Active
					</Badge>
				);
			case "upcoming":
				return (
					<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
						<Clock className="w-3 h-3 mr-1.5" />
						Upcoming
					</Badge>
				);
			case "completed":
				return (
					<Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700/50">
						<Trophy className="w-3 h-3 mr-1.5" />
						Completed
					</Badge>
				);
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	const getProviderInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const getParticipationRate = (challenge: Challenge) => {
		return Math.round(
			(challenge.participants / challenge.minParticipants) * 100
		);
	};

	if (loading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Challenge Management
						</h1>
						<p className="text-muted-foreground">
							Manage challenges, providers, and reward types
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-app-primary border-t-transparent"></div>
						<p className="text-sm text-muted-foreground">
							Loading challenges...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 animate-fadeIn">
			{/* Enhanced Header */}
			<div className="relative overflow-hidden rounded-xl border-2 border-border/50 bg-gradient-to-r from-app-primary/5 via-background to-app-secondary/5 p-6 shadow-md">
				<div className="absolute inset-0 bg-grid-pattern opacity-[0.015]"></div>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-full bg-gradient-to-br from-app-primary to-app-secondary flex items-center justify-center shadow-lg shadow-app-primary/20">
							<Trophy className="h-8 w-8 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								Challenge Management
							</h1>
							<p className="text-muted-foreground">
								Manage challenges, providers, and reward types
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setRewardTypesDialogOpen(true)}
							className="border-app-primary/20 text-app-primary hover:bg-app-primary/5 hover:text-app-primary hover:border-app-primary/30">
							<Gift className="mr-2 h-4 w-4" />
							Reward Types
						</Button>
						<Button
							variant="outline"
							onClick={() => setProvidersDialogOpen(true)}
							className="border-app-primary/20 text-app-primary hover:bg-app-primary/5 hover:text-app-primary hover:border-app-primary/30">
							<Users className="mr-2 h-4 w-4" />
							Providers
						</Button>
						<Button
							onClick={() => setCreateDialogOpen(true)}
							className="bg-app-primary hover:bg-app-primary/90 shadow-md shadow-app-primary/20 transition-all hover:shadow-lg hover:shadow-app-primary/30">
							<Plus className="mr-2 h-4 w-4" />
							New Challenge
						</Button>
					</div>
				</div>
			</div>

			{/* Enhanced Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Challenges
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
							<Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
							{stats.totalChallenges}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							All time challenges
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Challenges
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600 dark:text-green-400">
							{stats.activeChallenges}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Currently running
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Participants
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
							<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
							{stats.totalParticipants}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Across all challenges
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rewards Distributed
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
							<DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
							{stats.totalRewardsDistributed.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total value distributed
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Main Content */}
			<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl flex items-center gap-2">
								<Activity className="h-5 w-5 text-app-primary" />
								Challenges
							</CardTitle>
							<CardDescription>
								View and manage all challenges in the system
							</CardDescription>
						</div>
						<Badge
							variant="outline"
							className="bg-app-primary/10 text-app-primary border-app-primary/20">
							{filteredChallenges.length} challenges
						</Badge>
					</div>
					<Separator className="mt-2" />
				</CardHeader>
				<CardContent>
					{/* Enhanced Filters */}
					<div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 p-4 rounded-lg bg-muted/30 border border-border/50">
						<div className="flex items-center gap-2 flex-1">
							<div className="h-8 w-8 rounded-full bg-app-primary/20 flex items-center justify-center">
								<Search className="h-4 w-4 text-app-primary" />
							</div>
							<Input
								placeholder="Search challenges, descriptions, or providers..."
								className="border-border/50 focus:border-app-primary/50 focus:ring-app-primary/20"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-app-secondary/20 flex items-center justify-center">
								<Filter className="h-4 w-4 text-app-secondary" />
							</div>
							<Tabs
								value={statusFilter}
								onValueChange={(value) => setStatusFilter(value as any)}>
								<TabsList className="bg-background border border-border/50">
									<TabsTrigger
										value="all"
										className="data-[state=active]:bg-app-primary data-[state=active]:text-white">
										All
									</TabsTrigger>
									<TabsTrigger
										value="active"
										className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
										Active
									</TabsTrigger>
									<TabsTrigger
										value="upcoming"
										className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
										Upcoming
									</TabsTrigger>
									<TabsTrigger
										value="completed"
										className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
										Completed
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>

					{/* Enhanced Table */}
					<div className="rounded-lg border border-border/50 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50 hover:bg-muted/50">
									<TableHead className="font-semibold">Challenge</TableHead>
									<TableHead className="font-semibold">Provider</TableHead>
									<TableHead className="font-semibold">Period</TableHead>
									<TableHead className="font-semibold">Target</TableHead>
									<TableHead className="font-semibold">Participation</TableHead>
									<TableHead className="font-semibold">Reward</TableHead>
									<TableHead className="font-semibold">Cost</TableHead>
									<TableHead className="font-semibold">Status</TableHead>
									<TableHead className="w-[80px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredChallenges.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={9}
											className="text-center h-32 text-muted-foreground">
											<div className="flex flex-col items-center gap-3">
												<div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
													<Trophy className="h-8 w-8 text-muted-foreground/50" />
												</div>
												<div>
													<p className="font-medium">
														{searchQuery || statusFilter !== "all"
															? "No challenges match your filters."
															: "No challenges found."}
													</p>
													<p className="text-sm text-muted-foreground/70">
														{searchQuery || statusFilter !== "all"
															? "Try adjusting your search or filter criteria."
															: "Create your first challenge to get started."}
													</p>
												</div>
												{!searchQuery && statusFilter === "all" && (
													<Button
														onClick={() => setCreateDialogOpen(true)}
														className="bg-app-primary hover:bg-app-primary/90">
														<Plus className="mr-2 h-4 w-4" />
														Create Challenge
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								) : (
									filteredChallenges.map((challenge) => (
										<TableRow
											key={challenge.id}
											className="hover:bg-muted/30 transition-colors">
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="h-10 w-10 rounded-lg bg-gradient-to-br from-app-primary/20 to-app-secondary/20 flex items-center justify-center">
														<Target className="h-5 w-5 text-app-primary" />
													</div>
													<div>
														<div className="font-medium">{challenge.name}</div>
														<div className="text-sm text-muted-foreground truncate max-w-[200px]">
															{challenge.description}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{challenge.provider ? (
													<div className="flex items-center gap-2">
														<Avatar className="h-8 w-8">
															<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
																{getProviderInitials(challenge.provider.name)}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium text-sm">
																{challenge.provider.name}
															</div>
															<div className="text-xs text-muted-foreground flex items-center gap-1">
																<MapPin className="h-3 w-3" />
																{challenge.provider.address.split(",")[0]}
															</div>
														</div>
													</div>
												) : (
													<div className="flex items-center gap-2 text-muted-foreground">
														<div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
															<Users className="h-4 w-4" />
														</div>
														<span className="text-sm">No Provider</span>
													</div>
												)}
											</TableCell>
											<TableCell>
												<div className="text-sm space-y-1">
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3 text-green-500" />
														<span className="font-medium">
															{formatDate(challenge.startDate)}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3 text-red-500" />
														<span className="text-muted-foreground">
															{formatDate(challenge.endDate)}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
														<Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
													</div>
													<div>
														<div className="font-medium">
															{challenge.stepsRequired.toLocaleString()}
														</div>
														<div className="text-xs text-muted-foreground">
															steps required
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium">
															{challenge.participants}
														</span>
														<span className="text-xs text-muted-foreground">
															/ {challenge.minParticipants} min
														</span>
													</div>
													<Progress
														value={getParticipationRate(challenge)}
														className="h-2"
														style={{
															background: "hsl(var(--muted))",
														}}
													/>
													<div className="text-xs text-muted-foreground">
														{getParticipationRate(challenge)}% filled
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
														<Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
													</div>
													<div>
														<div className="font-medium text-sm">
															{challenge.reward.value} {challenge.reward.type}
														</div>
														<div className="text-xs text-muted-foreground">
															{challenge.reward.name}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div
														className={`h-8 w-8 rounded-full flex items-center justify-center ${
															challenge.joiningCost === 0
																? "bg-green-100 dark:bg-green-900/30"
																: "bg-orange-100 dark:bg-orange-900/30"
														}`}>
														<DollarSign
															className={`h-4 w-4 ${
																challenge.joiningCost === 0
																	? "text-green-600 dark:text-green-400"
																	: "text-orange-600 dark:text-orange-400"
															}`}
														/>
													</div>
													<div>
														<div className="font-medium text-sm">
															{challenge.joiningCost === 0
																? "Free"
																: `$${challenge.joiningCost}`}
														</div>
														<div className="text-xs text-muted-foreground">
															{challenge.joiningCost === 0
																? "No cost"
																: "Entry fee"}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getStatusBadge(getStatus(challenge))}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															className="h-8 w-8 p-0 hover:bg-muted/50"
															aria-label="Open menu">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="w-56">
														<DropdownMenuLabel className="flex items-center gap-2">
															<Activity className="h-4 w-4" />
															Actions
														</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link
																href={`/dashboard/challenges/${challenge.id}`}
																className="flex items-center gap-2">
																<Eye className="h-4 w-4" />
																View details
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<Link
																href={`/dashboard/challenges/${challenge.id}/edit`}
																className="flex items-center gap-2">
																<Edit className="h-4 w-4" />
																Edit challenge
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link
																href={`/dashboard/challenges/${challenge.id}/participants`}
																className="flex items-center gap-2">
																<UserPlus className="h-4 w-4" />
																View participants ({challenge.participants})
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600 dark:text-red-400 flex items-center gap-2"
															onClick={() =>
																handleDeleteChallenge(challenge.id)
															}>
															<Trash2 className="h-4 w-4" />
															Delete challenge
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

					{/* Summary Footer */}
					{filteredChallenges.length > 0 && (
						<div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-app-primary/5 to-app-secondary/5 border border-app-primary/20">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Trophy className="h-4 w-4 text-app-primary" />
										<span className="font-medium">
											Showing {filteredChallenges.length} of {challenges.length}{" "}
											challenges
										</span>
									</div>
									{statusFilter !== "all" && (
										<Badge
											variant="outline"
											className="bg-app-primary/10 text-app-primary border-app-primary/20">
											{statusFilter} filter active
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-4 text-muted-foreground">
									<div className="flex items-center gap-1">
										<Users className="h-4 w-4" />
										<span>
											{filteredChallenges.reduce(
												(sum, c) => sum + c.participants,
												0
											)}{" "}
											total participants
										</span>
									</div>
									<div className="flex items-center gap-1">
										<DollarSign className="h-4 w-4" />
										<span>
											{filteredChallenges
												.reduce(
													(sum, c) => sum + c.reward.value * c.participants,
													0
												)
												.toLocaleString()}{" "}
											potential rewards
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialogs */}
			<CreateChallengeDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				providers={providers}
				rewardTypes={rewardTypes}
				onSuccess={fetchChallenges}
			/>

			<ManageProvidersDialog
				open={providersDialogOpen}
				onOpenChange={setProvidersDialogOpen}
				providers={providers}
				onSuccess={fetchProviders}
			/>

			<ManageRewardTypesDialog
				open={rewardTypesDialogOpen}
				onOpenChange={setRewardTypesDialogOpen}
				rewardTypes={rewardTypes}
				onSuccess={fetchRewardTypes}
			/>
		</div>
	);
}
