"use client";

import { useEffect, useState } from "react";
import {
	MoreHorizontal,
	Plus,
	Search,
	Filter,
	Trophy,
	DollarSign,
	Edit,
	Trash2,
	TrendingUp,
	Award,
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
import { CreateRewardDialog } from "./create-reward-dialog";
import { CreateRewardTypeDialog } from "./create-reward-type-dialog";
import { EditRewardDialog } from "./edit-reward-dialog";
import { EditRewardTypeDialog } from "./edit-reward-type-dialog";
import { API_URL } from "@/lib/config.json";

interface RewardType {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface Reward {
	id: number;
	name: string;
	value: number;
	rewardTypeId: number;
	type: RewardType;
	createdAt: string;
	updatedAt: string;
	challengesCount?: number;
}

interface RewardStats {
	totalRewards: number;
	totalRewardTypes: number;
	totalValue: number;
	mostUsedType: string;
}

export default function RewardsPage() {
	const [rewards, setRewards] = useState<Reward[]>([]);
	const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
	const [stats, setStats] = useState<RewardStats>({
		totalRewards: 0,
		totalRewardTypes: 0,
		totalValue: 0,
		mostUsedType: "",
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [createRewardDialogOpen, setCreateRewardDialogOpen] = useState(false);
	const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
	const [editRewardDialogOpen, setEditRewardDialogOpen] = useState(false);
	const [editTypeDialogOpen, setEditTypeDialogOpen] = useState(false);
	const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
	const [selectedType, setSelectedType] = useState<RewardType | null>(null);

	useEffect(() => {
		fetchRewards();
		fetchRewardTypes();
	}, []);

	const fetchRewards = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/api/challenges/rewards`);
			const data = await response.json();

			if (response.ok) {
				setRewards(data.rewards || []);
				calculateStats(data.rewards || []);
			} else {
				console.error("Failed to fetch rewards:", data.message);
			}
		} catch (error) {
			console.error("Error fetching rewards:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchRewardTypes = async () => {
		try {
			const response = await fetch(`${API_URL}/api/challenges/reward-types`);
			const data = await response.json();

			if (response.ok) {
				setRewardTypes(data || []);
			}
		} catch (error) {
			console.error("Error fetching reward types:", error);
		}
	};

	const calculateStats = (rewardsList: Reward[]) => {
		const totalValue = rewardsList.reduce(
			(sum, reward) => sum + reward.value,
			0
		);

		// Count rewards by type
		const typeCounts: { [key: string]: number } = {};
		rewardsList.forEach((reward) => {
			const typeName = reward.type.name;
			typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
		});

		const mostUsedType = Object.keys(typeCounts).reduce(
			(a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
			""
		);

		setStats({
			totalRewards: rewardsList.length,
			totalRewardTypes: new Set(rewardsList.map((r) => r.type.name)).size,
			totalValue,
			mostUsedType,
		});
	};

	const handleDeleteReward = async (rewardId: number) => {
		if (
			!confirm(
				"Are you sure you want to delete this reward? This action cannot be undone."
			)
		)
			return;

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/rewards/${rewardId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				fetchRewards();
			} else {
				const errorData = await response.json();
				alert(errorData.message || "Failed to delete reward");
			}
		} catch (error) {
			console.error("Error deleting reward:", error);
			alert("Failed to delete reward");
		}
	};

	const handleDeleteRewardType = async (typeId: number) => {
		if (
			!confirm(
				"Are you sure you want to delete this reward type? This will affect all associated rewards."
			)
		)
			return;

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/rewardType/${typeId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				fetchRewardTypes();
				fetchRewards(); // Refresh rewards as well
			} else {
				const errorData = await response.json();
				alert(errorData.message || "Failed to delete reward type");
			}
		} catch (error) {
			console.error("Error deleting reward type:", error);
			alert("Failed to delete reward type");
		}
	};

	const handleEditReward = (reward: Reward) => {
		setSelectedReward(reward);
		setEditRewardDialogOpen(true);
	};

	const handleEditRewardType = (type: RewardType) => {
		setSelectedType(type);
		setEditTypeDialogOpen(true);
	};

	const filteredRewards = rewards.filter((reward) => {
		const matchesSearch =
			reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			reward.type.name.toLowerCase().includes(searchQuery.toLowerCase());

		if (!matchesSearch) return false;

		if (typeFilter === "all") return true;
		return reward.type.name === typeFilter;
	});

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString()} ETB`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getTypeColor = (typeName: string) => {
		const colors: { [key: string]: string } = {
			"Cash": "bg-green-100 text-green-800",
			"Points": "bg-blue-100 text-blue-800",
			"Gift Card": "bg-purple-100 text-purple-800",
			"Voucher": "bg-orange-100 text-orange-800",
		};
		return colors[typeName] || "bg-gray-100 text-gray-800";
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Reward Management
					</h1>
					<p className="text-muted-foreground">
						Manage rewards and reward types for challenges
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setCreateTypeDialogOpen(true)}>
						<Award className="mr-2 h-4 w-4" />
						New Reward Type
					</Button>
					<Button onClick={() => setCreateRewardDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Reward
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
						<Trophy className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalRewards}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Reward Types</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalRewardTypes}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Value</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.totalValue)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Most Used Type
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.mostUsedType || "N/A"}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Rewards Table */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Rewards</CardTitle>
							<CardDescription>
								Manage individual rewards and their values
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Filters */}
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-2 flex-1">
									<Search className="h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search rewards..."
										className="max-w-sm"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-muted-foreground" />
									<Tabs value={typeFilter} onValueChange={setTypeFilter}>
										<TabsList>
											<TabsTrigger value="all">All Types</TabsTrigger>
											{rewardTypes.map((type) => (
												<TabsTrigger key={type.id} value={type.name}>
													{type.name}
												</TabsTrigger>
											))}
										</TabsList>
									</Tabs>
								</div>
							</div>

							{/* Table */}
							{loading ? (
								<div className="flex items-center justify-center h-64">
									<p className="text-muted-foreground">Loading rewards...</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Reward Name</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Value</TableHead>
											<TableHead>Created</TableHead>
											<TableHead className="w-[80px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredRewards.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={5}
													className="text-center h-24 text-muted-foreground">
													{searchQuery || typeFilter !== "all"
														? "No rewards match your filters."
														: "No rewards found."}
												</TableCell>
											</TableRow>
										) : (
											filteredRewards.map((reward) => (
												<TableRow key={reward.id}>
													<TableCell className="font-medium">
														{reward.name}
													</TableCell>
													<TableCell>
														<Badge className={getTypeColor(reward.type.name)}>
															{reward.type.name}
														</Badge>
													</TableCell>
													<TableCell className="font-medium">
														{formatCurrency(reward.value)}
													</TableCell>
													<TableCell className="text-sm text-muted-foreground">
														{formatDate(reward.createdAt)}
													</TableCell>
													<TableCell>
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
																	onClick={() => handleEditReward(reward)}>
																	<Edit className="w-4 h-4 mr-2" />
																	Edit reward
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className="text-red-600"
																	onClick={() => handleDeleteReward(reward.id)}>
																	<Trash2 className="w-4 h-4 mr-2" />
																	Delete reward
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Reward Types */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Reward Types</CardTitle>
							<CardDescription>Manage reward categories</CardDescription>
						</CardHeader>
						<CardContent>
							{rewardTypes.length === 0 ? (
								<div className="text-center py-8">
									<Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground">No reward types found</p>
								</div>
							) : (
								<div className="space-y-2">
									{rewardTypes.map((type) => (
										<div
											key={type.id}
											className="flex items-center justify-between border rounded-lg p-3">
											<div>
												<p className="font-medium">{type.name}</p>
												<p className="text-sm text-muted-foreground">
													Created {formatDate(type.createdAt)}
												</p>
											</div>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleEditRewardType(type)}>
													<Edit className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDeleteRewardType(type.id)}>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Dialogs */}
			<CreateRewardDialog
				open={createRewardDialogOpen}
				onOpenChange={setCreateRewardDialogOpen}
				rewardTypes={rewardTypes}
				onSuccess={fetchRewards}
			/>

			<CreateRewardTypeDialog
				open={createTypeDialogOpen}
				onOpenChange={setCreateTypeDialogOpen}
				onSuccess={fetchRewardTypes}
			/>

			<EditRewardDialog
				open={editRewardDialogOpen}
				onOpenChange={setEditRewardDialogOpen}
				reward={selectedReward}
				rewardTypes={rewardTypes}
				onSuccess={fetchRewards}
			/>

			<EditRewardTypeDialog
				open={editTypeDialogOpen}
				onOpenChange={setEditTypeDialogOpen}
				rewardType={selectedType}
				onSuccess={fetchRewardTypes}
			/>
		</div>
	);
}
// "use client";

// import { useEffect, useState } from "react";
// import {
// 	MoreHorizontal,
// 	Plus,
// 	Search,
// 	Filter,
// 	Trophy,
// 	DollarSign,
// 	Edit,
// 	Trash2,
// 	TrendingUp,
// 	Award,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CreateRewardDialog } from "./create-reward-dialog";
// import { CreateRewardTypeDialog } from "./create-reward-type-dialog";
// import { EditRewardDialog } from "./edit-reward-dialog";
// import { EditRewardTypeDialog } from "./edit-reward-type-dialog";
// import { API_URL } from "@/lib/config.json";

// interface RewardType {
// 	id: number;
// 	name: string;
// 	createdAt: string;
// 	updatedAt: string;
// }

// interface Reward {
// 	id: number;
// 	name: string;
// 	value: number;
// 	rewardTypeId: number;
// 	type: RewardType;
// 	createdAt: string;
// 	updatedAt: string;
// 	challengesCount?: number;
// }

// interface RewardStats {
// 	totalRewards: number;
// 	totalRewardTypes: number;
// 	totalValue: number;
// 	mostUsedType: string;
// }

// export default function RewardsPage() {
// 	const [rewards, setRewards] = useState<Reward[]>([]);
// 	const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
// 	const [stats, setStats] = useState<RewardStats>({
// 		totalRewards: 0,
// 		totalRewardTypes: 0,
// 		totalValue: 0,
// 		mostUsedType: "",
// 	});
// 	const [loading, setLoading] = useState(true);
// 	const [searchQuery, setSearchQuery] = useState("");
// 	const [typeFilter, setTypeFilter] = useState<string>("all");
// 	const [createRewardDialogOpen, setCreateRewardDialogOpen] = useState(false);
// 	const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
// 	const [editRewardDialogOpen, setEditRewardDialogOpen] = useState(false);
// 	const [editTypeDialogOpen, setEditTypeDialogOpen] = useState(false);
// 	const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
// 	const [selectedType, setSelectedType] = useState<RewardType | null>(null);

// 	useEffect(() => {
// 		fetchRewards();
// 		fetchRewardTypes();
// 	}, []);

// 	const fetchRewards = async () => {
// 		try {
// 			setLoading(true);
// 			const response = await fetch(
// 				`${API_URL}/api/challenges/rewards`
// 			);
// 			const data = await response.json();

// 			if (response.ok) {
// 				setRewards(data.rewards || []);
// 				calculateStats(data.rewards || []);
// 			} else {
// 				console.error("Failed to fetch rewards:", data.message);
// 			}
// 		} catch (error) {
// 			console.error("Error fetching rewards:", error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const fetchRewardTypes = async () => {
// 		try {
// 			const response = await fetch(
// 				`${API_URL}/api/challenges/reward-types`
// 			);
// 			const data = await response.json();

// 			if (response.ok) {
// 				setRewardTypes(data || []);
// 			}
// 		} catch (error) {
// 			console.error("Error fetching reward types:", error);
// 		}
// 	};

// 	const calculateStats = (rewardsList: Reward[]) => {
// 		const totalValue = rewardsList.reduce(
// 			(sum, reward) => sum + reward.value,
// 			0
// 		);

// 		// Count rewards by type
// 		const typeCounts: { [key: string]: number } = {};
// 		rewardsList.forEach((reward) => {
// 			const typeName = reward.type.name;
// 			typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
// 		});

// 		const mostUsedType = Object.keys(typeCounts).reduce(
// 			(a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
// 			""
// 		);

// 		setStats({
// 			totalRewards: rewardsList.length,
// 			totalRewardTypes: new Set(rewardsList.map((r) => r.type.name)).size,
// 			totalValue,
// 			mostUsedType,
// 		});
// 	};

// 	const handleDeleteReward = async (rewardId: number) => {
// 		if (
// 			!confirm(
// 				"Are you sure you want to delete this reward? This action cannot be undone."
// 			)
// 		)
// 			return;

// 		try {
// 			const response = await fetch(
// 				`${API_URL}/api/rewards/${rewardId}`,
// 				{
// 					method: "DELETE",
// 				}
// 			);

// 			if (response.ok) {
// 				fetchRewards();
// 			} else {
// 				alert("Failed to delete reward");
// 			}
// 		} catch (error) {
// 			console.error("Error deleting reward:", error);
// 			alert("Failed to delete reward");
// 		}
// 	};

// 	const handleDeleteRewardType = async (typeId: number) => {
// 		if (
// 			!confirm(
// 				"Are you sure you want to delete this reward type? This will affect all associated rewards."
// 			)
// 		)
// 			return;

// 		try {
// 			const response = await fetch(
// 				`${API_URL}/api/challenges/rewardType/${typeId}`,
// 				{
// 					method: "DELETE",
// 				}
// 			);

// 			if (response.ok) {
// 				fetchRewardTypes();
// 				fetchRewards(); // Refresh rewards as well
// 			} else {
// 				alert("Failed to delete reward type");
// 			}
// 		} catch (error) {
// 			console.error("Error deleting reward type:", error);
// 			alert("Failed to delete reward type");
// 		}
// 	};

// 	const handleEditReward = (reward: Reward) => {
// 		setSelectedReward(reward);
// 		setEditRewardDialogOpen(true);
// 	};

// 	const handleEditRewardType = (type: RewardType) => {
// 		setSelectedType(type);
// 		setEditTypeDialogOpen(true);
// 	};

// 	const filteredRewards = rewards.filter((reward) => {
// 		const matchesSearch =
// 			reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 			reward.type.name.toLowerCase().includes(searchQuery.toLowerCase());

// 		if (!matchesSearch) return false;

// 		if (typeFilter === "all") return true;
// 		return reward.type.name === typeFilter;
// 	});

// 	const formatCurrency = (amount: number) => {
// 		return `${amount.toLocaleString()} ETB`;
// 	};

// 	const formatDate = (dateString: string) => {
// 		return new Date(dateString).toLocaleDateString("en-US", {
// 			year: "numeric",
// 			month: "short",
// 			day: "numeric",
// 			hour: "2-digit",
// 			minute: "2-digit",
// 		});
// 	};

// 	const getTypeColor = (typeName: string) => {
// 		const colors: { [key: string]: string } = {
// 			"Cash": "bg-green-100 text-green-800",
// 			"Points": "bg-blue-100 text-blue-800",
// 			"Gift Card": "bg-purple-100 text-purple-800",
// 			"Voucher": "bg-orange-100 text-orange-800",
// 		};
// 		return colors[typeName] || "bg-gray-100 text-gray-800";
// 	};

// 	return (
// 		<div className="flex flex-col gap-6">
// 			{/* Header */}
// 			<div className="flex items-center justify-between">
// 				<div>
// 					<h1 className="text-3xl font-bold tracking-tight">
// 						Reward Management
// 					</h1>
// 					<p className="text-muted-foreground">
// 						Manage rewards and reward types for challenges
// 					</p>
// 				</div>
// 				<div className="flex gap-2">
// 					<Button
// 						variant="outline"
// 						onClick={() => setCreateTypeDialogOpen(true)}>
// 						<Award className="mr-2 h-4 w-4" />
// 						New Reward Type
// 					</Button>
// 					<Button onClick={() => setCreateRewardDialogOpen(true)}>
// 						<Plus className="mr-2 h-4 w-4" />
// 						New Reward
// 					</Button>
// 				</div>
// 			</div>

// 			{/* Stats Cards */}
// 			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
// 						<Trophy className="h-4 w-4 text-muted-foreground" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.totalRewards}</div>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">Reward Types</CardTitle>
// 						<Award className="h-4 w-4 text-muted-foreground" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.totalRewardTypes}</div>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">Total Value</CardTitle>
// 						<DollarSign className="h-4 w-4 text-muted-foreground" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">
// 							{formatCurrency(stats.totalValue)}
// 						</div>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">
// 							Most Used Type
// 						</CardTitle>
// 						<TrendingUp className="h-4 w-4 text-muted-foreground" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">
// 							{stats.mostUsedType || "N/A"}
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Main Content */}
// 			<div className="grid gap-6 lg:grid-cols-3">
// 				{/* Rewards Table */}
// 				<div className="lg:col-span-2">
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Rewards</CardTitle>
// 							<CardDescription>
// 								Manage individual rewards and their values
// 							</CardDescription>
// 						</CardHeader>
// 						<CardContent>
// 							{/* Filters */}
// 							<div className="flex items-center gap-4 mb-6">
// 								<div className="flex items-center gap-2 flex-1">
// 									<Search className="h-4 w-4 text-muted-foreground" />
// 									<Input
// 										placeholder="Search rewards..."
// 										className="max-w-sm"
// 										value={searchQuery}
// 										onChange={(e) => setSearchQuery(e.target.value)}
// 									/>
// 								</div>
// 								<div className="flex items-center gap-2">
// 									<Filter className="h-4 w-4 text-muted-foreground" />
// 									<Tabs value={typeFilter} onValueChange={setTypeFilter}>
// 										<TabsList>
// 											<TabsTrigger value="all">All Types</TabsTrigger>
// 											{rewardTypes.map((type) => (
// 												<TabsTrigger key={type.id} value={type.name}>
// 													{type.name}
// 												</TabsTrigger>
// 											))}
// 										</TabsList>
// 									</Tabs>
// 								</div>
// 							</div>

// 							{/* Table */}
// 							{loading ? (
// 								<div className="flex items-center justify-center h-64">
// 									<p className="text-muted-foreground">Loading rewards...</p>
// 								</div>
// 							) : (
// 								<Table>
// 									<TableHeader>
// 										<TableRow>
// 											<TableHead>Reward Name</TableHead>
// 											<TableHead>Type</TableHead>
// 											<TableHead>Value</TableHead>
// 											<TableHead>Created</TableHead>
// 											<TableHead className="w-[80px]"></TableHead>
// 										</TableRow>
// 									</TableHeader>
// 									<TableBody>
// 										{filteredRewards.length === 0 ? (
// 											<TableRow>
// 												<TableCell
// 													colSpan={5}
// 													className="text-center h-24 text-muted-foreground">
// 													{searchQuery || typeFilter !== "all"
// 														? "No rewards match your filters."
// 														: "No rewards found."}
// 												</TableCell>
// 											</TableRow>
// 										) : (
// 											filteredRewards.map((reward) => (
// 												<TableRow key={reward.id}>
// 													<TableCell className="font-medium">
// 														{reward.name}
// 													</TableCell>
// 													<TableCell>
// 														<Badge className={getTypeColor(reward.type.name)}>
// 															{reward.type.name}
// 														</Badge>
// 													</TableCell>
// 													<TableCell className="font-medium">
// 														{formatCurrency(reward.value)}
// 													</TableCell>
// 													<TableCell className="text-sm text-muted-foreground">
// 														{formatDate(reward.createdAt)}
// 													</TableCell>
// 													<TableCell>
// 														<DropdownMenu>
// 															<DropdownMenuTrigger asChild>
// 																<Button
// 																	variant="ghost"
// 																	className="h-8 w-8 p-0"
// 																	aria-label="Open menu">
// 																	<MoreHorizontal className="h-4 w-4" />
// 																</Button>
// 															</DropdownMenuTrigger>
// 															<DropdownMenuContent align="end">
// 																<DropdownMenuLabel>Actions</DropdownMenuLabel>
// 																<DropdownMenuItem
// 																	onClick={() => handleEditReward(reward)}>
// 																	<Edit className="w-4 h-4 mr-2" />
// 																	Edit reward
// 																</DropdownMenuItem>
// 																<DropdownMenuSeparator />
// 																<DropdownMenuItem
// 																	className="text-red-600"
// 																	onClick={() => handleDeleteReward(reward.id)}>
// 																	<Trash2 className="w-4 h-4 mr-2" />
// 																	Delete reward
// 																</DropdownMenuItem>
// 															</DropdownMenuContent>
// 														</DropdownMenu>
// 													</TableCell>
// 												</TableRow>
// 											))
// 										)}
// 									</TableBody>
// 								</Table>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div>

// 				{/* Reward Types */}
// 				<div>
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Reward Types</CardTitle>
// 							<CardDescription>Manage reward categories</CardDescription>
// 						</CardHeader>
// 						<CardContent>
// 							{rewardTypes.length === 0 ? (
// 								<div className="text-center py-8">
// 									<Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
// 									<p className="text-muted-foreground">No reward types found</p>
// 								</div>
// 							) : (
// 								<div className="space-y-2">
// 									{rewardTypes.map((type) => (
// 										<div
// 											key={type.id}
// 											className="flex items-center justify-between border rounded-lg p-3">
// 											<div>
// 												<p className="font-medium">{type.name}</p>
// 												<p className="text-sm text-muted-foreground">
// 													Created {formatDate(type.createdAt)}
// 												</p>
// 											</div>
// 											<div className="flex gap-1">
// 												<Button
// 													size="sm"
// 													variant="outline"
// 													onClick={() => handleEditRewardType(type)}>
// 													<Edit className="h-3 w-3" />
// 												</Button>
// 												<Button
// 													size="sm"
// 													variant="outline"
// 													onClick={() => handleDeleteRewardType(type.id)}>
// 													<Trash2 className="h-3 w-3" />
// 												</Button>
// 											</div>
// 										</div>
// 									))}
// 								</div>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div>
// 			</div>

// 			{/* Dialogs */}
// 			<CreateRewardDialog
// 				open={createRewardDialogOpen}
// 				onOpenChange={setCreateRewardDialogOpen}
// 				rewardTypes={rewardTypes}
// 				onSuccess={fetchRewards}
// 			/>

// 			<CreateRewardTypeDialog
// 				open={createTypeDialogOpen}
// 				onOpenChange={setCreateTypeDialogOpen}
// 				onSuccess={fetchRewardTypes}
// 			/>

// 			<EditRewardDialog
// 				open={editRewardDialogOpen}
// 				onOpenChange={setEditRewardDialogOpen}
// 				reward={selectedReward}
// 				rewardTypes={rewardTypes}
// 				onSuccess={fetchRewards}
// 			/>

// 			<EditRewardTypeDialog
// 				open={editTypeDialogOpen}
// 				onOpenChange={setEditTypeDialogOpen}
// 				rewardType={selectedType}
// 				onSuccess={fetchRewardTypes}
// 			/>
// 		</div>
// 	);
// }
