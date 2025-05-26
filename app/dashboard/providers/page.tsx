"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	MoreHorizontal,
	Plus,
	Search,
	Users,
	Building,
	Phone,
	MapPin,
	Edit,
	Trash2,
	TrendingUp,
	Calendar,
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
import { CreateProviderDialog } from "./create-provider-dialog";
import { EditProviderDialog } from "./edit-provider-dialog";

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	challengesCount?: number;
}

interface ProviderStats {
	totalProviders: number;
	activeProviders: number;
	totalChallenges: number;
	averageChallengesPerProvider: number;
}

export default function ProvidersPage() {
	const [providers, setProviders] = useState<ChallengeProvider[]>([]);
	const [stats, setStats] = useState<ProviderStats>({
		totalProviders: 0,
		activeProviders: 0,
		totalChallenges: 0,
		averageChallengesPerProvider: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] =
		useState<ChallengeProvider | null>(null);

	useEffect(() => {
		fetchProviders();
	}, []);

	const fetchProviders = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				"http://localhost:3001/api/challenges/providers"
			);
			const data = await response.json();

			if (response.ok) {
				setProviders(data || []);
				calculateStats(data || []);
			} else {
				console.error("Failed to fetch providers:", data.message);
			}
		} catch (error) {
			console.error("Error fetching providers:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateStats = (providersList: ChallengeProvider[]) => {
		const totalChallenges = providersList.reduce(
			(sum, provider) => sum + (provider.challengesCount || 0),
			0
		);
		const activeProviders = providersList.filter(
			(provider) => (provider.challengesCount || 0) > 0
		).length;
		const averageChallengesPerProvider =
			providersList.length > 0 ? totalChallenges / providersList.length : 0;

		setStats({
			totalProviders: providersList.length,
			activeProviders,
			totalChallenges,
			averageChallengesPerProvider,
		});
	};

	const handleDeleteProvider = async (providerId: number) => {
		if (
			!confirm(
				"Are you sure you want to delete this provider? This action cannot be undone."
			)
		)
			return;

		try {
			const response = await fetch(
				`http://localhost:3001/api/challenges/challengeProvider/${providerId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				fetchProviders();
			} else {
				alert("Failed to delete provider");
			}
		} catch (error) {
			console.error("Error deleting provider:", error);
			alert("Failed to delete provider");
		}
	};

	const handleEditProvider = (provider: ChallengeProvider) => {
		setSelectedProvider(provider);
		setEditDialogOpen(true);
	};

	const filteredProviders = providers.filter(
		(provider) =>
			provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			provider.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
			provider.phone.includes(searchQuery)
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

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Provider Management
					</h1>
					<p className="text-muted-foreground">
						Manage challenge providers and their information
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Provider
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Providers
						</CardTitle>
						<Building className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalProviders}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Providers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeProviders}</div>
						<p className="text-xs text-muted-foreground">
							With active challenges
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Challenges
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalChallenges}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg Challenges
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.averageChallengesPerProvider.toFixed(1)}
						</div>
						<p className="text-xs text-muted-foreground">Per provider</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Card>
				<CardHeader>
					<CardTitle>Challenge Providers</CardTitle>
					<CardDescription>
						Manage organizations and companies providing challenges
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Search */}
					<div className="flex items-center gap-2 mb-6">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search providers by name, address, or phone..."
							className="max-w-sm"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* Table */}
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<p className="text-muted-foreground">Loading providers...</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Provider</TableHead>
									<TableHead>Contact Info</TableHead>
									<TableHead>Challenges</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[80px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProviders.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center h-24 text-muted-foreground">
											{searchQuery
												? "No providers match your search."
												: "No providers found."}
										</TableCell>
									</TableRow>
								) : (
									filteredProviders.map((provider) => (
										<TableRow key={provider.id}>
											<TableCell>
												<div>
													<div className="font-medium">{provider.name}</div>
													{provider.description && (
														<div className="text-sm text-muted-foreground truncate max-w-[200px]">
															{provider.description}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center gap-2 text-sm">
														<MapPin className="h-3 w-3 text-muted-foreground" />
														<span className="truncate max-w-[200px]">
															{provider.address}
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<Phone className="h-3 w-3 text-muted-foreground" />
														<span>{provider.phone}</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-center">
													<div className="font-medium">
														{provider.challengesCount || 0}
													</div>
													<div className="text-sm text-muted-foreground">
														challenges
													</div>
												</div>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatDate(provider.createdAt)}
											</TableCell>
											<TableCell>
												{(provider.challengesCount || 0) > 0 ? (
													<Badge className="bg-green-100 text-green-800">
														Active
													</Badge>
												) : (
													<Badge variant="secondary">Inactive</Badge>
												)}
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
															onClick={() => handleEditProvider(provider)}>
															<Edit className="w-4 h-4 mr-2" />
															Edit provider
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link
																href={`/dashboard/providers/${provider.id}/challenges`}>
																<Calendar className="w-4 h-4 mr-2" />
																View challenges ({provider.challengesCount || 0}
																)
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleDeleteProvider(provider.id)}>
															<Trash2 className="w-4 h-4 mr-2" />
															Delete provider
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

			{/* Dialogs */}
			<CreateProviderDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={fetchProviders}
			/>

			<EditProviderDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				provider={selectedProvider}
				onSuccess={fetchProviders}
			/>
		</div>
	);
}
