"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, MoreHorizontal, Search, Users } from "lucide-react";

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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Referral {
	id: number;
	referralCode: string;
	status: string;
	pointsAwarded: number | null;
	invitedEmail: string | null;
	createdAt: string;
	referrer: {
		id: number;
		name: string;
		email: string;
	};
	referredUser: {
		id: number;
		name: string;
		email: string;
	} | null;
}

export default function ReferralsPage() {
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	useEffect(() => {
		const fetchReferrals = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/admin/referrals", {
					headers: {
						Authorization:
							"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJhZG1pbjEyQGdtYWlsLmNvbSIsImlzUG9ydGFsVXNlciI6dHJ1ZSwiaWF0IjoxNzQ3NDY5MDkwLCJleHAiOjE3NTAwNjEwOTB9.ZNMZ1ymCn76MyGYalLbrxhpcbVYC-suGS34K9TCik2M",
					},
				});
				const data = await response.json();

				if (data.referrals) {
					setReferrals(data.referrals);
				}
			} catch (error) {
				console.error("Error fetching referrals:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchReferrals();
	}, []);

	const filteredReferrals = referrals.filter((referral) => {
		const matchesSearch =
			referral.referrer.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			referral.referrer.email
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			(referral.invitedEmail &&
				referral.invitedEmail
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(referral.referredUser &&
				(referral.referredUser.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
					referral.referredUser.email
						.toLowerCase()
						.includes(searchQuery.toLowerCase())));

		const matchesStatus =
			statusFilter === "all" ||
			referral.status.toLowerCase() === statusFilter.toLowerCase();

		return matchesSearch && matchesStatus;
	});

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Referral Management
				</h1>
				<p className="text-muted-foreground">
					View and manage user referrals and invitations
				</p>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-app-primary"></div>
					<h2 className="text-xl font-semibold">Referrals</h2>
				</div>
			</div>

			<Card className="dashboard-card app-border">
				<CardHeader className="pb-3">
					<CardTitle>Referral Activity</CardTitle>
					<CardDescription>
						Track user invitations and referral conversions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
						<div className="relative max-w-md w-full">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by user or email..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="flex flex-col items-center gap-2">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
								<p className="text-sm text-muted-foreground">
									Loading referrals...
								</p>
							</div>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/50">
										<TableHead>Referrer</TableHead>
										<TableHead>Invited</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Referral Code</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Reward</TableHead>
										<TableHead className="w-[80px]"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredReferrals.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={7}
												className="text-center h-24 text-muted-foreground">
												No referrals found matching your search.
											</TableCell>
										</TableRow>
									) : (
										filteredReferrals.map((referral) => (
											<TableRow key={referral.id} className="hover:bg-muted/50">
												<TableCell>
													<div className="font-medium">
														{referral.referrer.name}
													</div>
													<div className="text-xs text-muted-foreground">
														{referral.referrer.email}
													</div>
												</TableCell>
												<TableCell>
													{referral.referredUser ? (
														<>
															<div className="font-medium">
																{referral.referredUser.name}
															</div>
															<div className="text-xs text-muted-foreground">
																{referral.referredUser.email}
															</div>
														</>
													) : (
														<div className="text-sm text-muted-foreground">
															{referral.invitedEmail || "Unknown"}
														</div>
													)}
												</TableCell>
												<TableCell>
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
															referral.status === "COMPLETED"
																? "bg-green-100 text-green-800"
																: referral.status === "PENDING"
																? "bg-yellow-100 text-yellow-800"
																: referral.status === "EXPIRED"
																? "bg-gray-100 text-gray-800"
																: "bg-red-100 text-red-800"
														}`}>
														{referral.status}
													</span>
												</TableCell>
												<TableCell>
													<code className="px-2 py-1 bg-muted rounded text-xs">
														{referral.referralCode}
													</code>
												</TableCell>
												<TableCell>{formatDate(referral.createdAt)}</TableCell>
												<TableCell>
													{referral.pointsAwarded ? (
														<span className="text-green-600 font-medium">
															+{referral.pointsAwarded} points
														</span>
													) : (
														<span className="text-muted-foreground text-sm">
															-
														</span>
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
															<DropdownMenuItem asChild>
																<Link
																	href={`/dashboard/users/${referral.referrer.id}`}>
																	View referrer
																</Link>
															</DropdownMenuItem>
															{referral.referredUser && (
																<DropdownMenuItem asChild>
																	<Link
																		href={`/dashboard/users/${referral.referredUser.id}`}>
																		View referred user
																	</Link>
																</DropdownMenuItem>
															)}
															{referral.status === "PENDING" && (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem>
																		Mark as expired
																	</DropdownMenuItem>
																</>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
