"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
	ArrowLeft,
	Calendar,
	Users,
	Trophy,
	Target,
	DollarSign,
	Clock,
	MapPin,
	Phone,
	Edit,
	Trash2,
	Download,
	Share2,
	BarChart3,
	TrendingUp,
	CheckCircle,
	XCircle,
	AlertCircle,
	Medal,
	Crown,
	Bell,
	Send,
	Star,
	Sparkles,
	Activity,
	Gift,
	Eye,
	UserCheck,
	Footprints,
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
import { Progress } from "@/components/ui/progress";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
}

interface Reward {
	id: number;
	name: string;
	value: number;
	type: string;
}

interface Participant {
	rank: number;
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

interface Winner {
	participant: Participant;
	isEligible: boolean;
	reason?: string;
}

export default function ChallengeDetailPage() {
	const params = useParams();
	const router = useRouter();
	const challengeId = params.id as string;

	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState("");
	const [sendingNotification, setSendingNotification] = useState(false);
	const [notificationSent, setNotificationSent] = useState(false);

	useEffect(() => {
		if (challengeId) {
			fetchChallengeDetails();
		}
	}, [challengeId]);

	const fetchChallengeDetails = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${API_URL}/api/challenges/getChallenges/${challengeId}`
			);
			const data = await response.json();

			if (response.ok) {
				setChallenge(data.challenge);
			} else {
				console.error("Failed to fetch challenge:", data.message);
			}
		} catch (error) {
			console.error("Error fetching challenge:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteChallenge = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this challenge? This action cannot be undone."
			)
		)
			return;

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/${challengeId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				router.push("/dashboard/challenges");
			} else {
				alert("Failed to delete challenge");
			}
		} catch (error) {
			console.error("Error deleting challenge:", error);
			alert("Failed to delete challenge");
		}
	};

	const handleSendWinnerNotification = async () => {
		if (!challenge || !getWinner()?.isEligible) return;

		setSendingNotification(true);
		try {
			const winner = getWinner();
			const response = await fetch(
				`${API_URL}/api/notifications/winner`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						challengeId: challenge.id,
						winnerId: winner?.participant.userId,
						challengeName: challenge.name,
						rewardValue: challenge.reward.value,
						rewardType: challenge.reward.type,
						customMessage: notificationMessage,
					}),
				}
			);

			if (response.ok) {
				setNotificationSent(true);
				setNotificationDialogOpen(false);
				setNotificationMessage("");
				setTimeout(() => setNotificationSent(false), 5000);
			} else {
				alert("Failed to send notification");
			}
		} catch (error) {
			console.error("Error sending notification:", error);
			alert("Failed to send notification");
		} finally {
			setSendingNotification(false);
		}
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString()} ETB`;
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

	const getWinner = (): Winner | null => {
		if (!challenge || challenge.participantsList.length === 0) return null;

		const status = getStatus(challenge);
		if (status !== "completed") return null;

		const topParticipant = challenge.participantsList[0];
		const isEligible = topParticipant.steps >= challenge.stepsRequired;

		return {
			participant: topParticipant,
			isEligible,
			reason: !isEligible ? "Did not meet minimum step requirement" : undefined,
		};
	};

	const getRankBadge = (rank: number, participant: Participant) => {
		const winner = getWinner();
		const isWinner =
			winner?.isEligible && participant.userId === winner.participant.userId;

		if (isWinner) {
			return (
				<div className="flex items-center gap-2">
					<Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg border-0">
						<Crown className="w-4 h-4 mr-1" />
						WINNER
					</Badge>
					<Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
				</div>
			);
		}

		switch (rank) {
			case 1:
				return (
					<Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700/50">
						<Medal className="w-3 h-3 mr-1" />
						1st
					</Badge>
				);
			case 2:
				return (
					<Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300 border-gray-300 dark:border-gray-600/50">
						<Medal className="w-3 h-3 mr-1" />
						2nd
					</Badge>
				);
			case 3:
				return (
					<Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-300 border-orange-300 dark:border-orange-700/50">
						<Medal className="w-3 h-3 mr-1" />
						3rd
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="bg-muted/30">
						#{rank}
					</Badge>
				);
		}
	};

	const getParticipantStatus = (participant: Participant) => {
		const winner = getWinner();
		const isWinner =
			winner?.isEligible && participant.userId === winner.participant.userId;

		if (isWinner) {
			return (
				<Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white border-0">
					<Crown className="w-3 h-3 mr-1" />
					Winner
				</Badge>
			);
		}

		if (participant.progress >= 100) {
			return (
				<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50">
					<CheckCircle className="w-3 h-3 mr-1" />
					Completed
				</Badge>
			);
		}

		return (
			<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
				<Clock className="w-3 h-3 mr-1" />
				In Progress
			</Badge>
		);
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
					<h1 className="text-3xl font-bold tracking-tight">
						Challenge Details
					</h1>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-app-primary border-t-transparent"></div>
						<p className="text-sm text-muted-foreground">
							Loading challenge details...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!challenge) {
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
					<h1 className="text-3xl font-bold tracking-tight">
						Challenge Details
					</h1>
				</div>
				<Card className="border-2 border-border/50 shadow-md">
					<CardContent className="flex items-center justify-center h-64">
						<div className="flex flex-col items-center gap-4 text-center">
							<div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
								<XCircle className="h-8 w-8 text-red-500" />
							</div>
							<div>
								<h2 className="text-xl font-semibold mb-2">
									Challenge Not Found
								</h2>
								<p className="text-muted-foreground mb-4">
									The challenge you're looking for doesn't exist.
								</p>
							</div>
							<Button
								asChild
								className="bg-app-primary hover:bg-app-primary/90">
								<Link href="/dashboard/challenges">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Challenges
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const status = getStatus(challenge);
	const completedParticipants = challenge.participantsList.filter(
		(p) => p.progress >= 100
	).length;
	const completionRate =
		challenge.participants > 0
			? (completedParticipants / challenge.participants) * 100
			: 0;
	const winner = getWinner();

	return (
		<div className="flex flex-col gap-6 animate-fadeIn">
			{/* Notification Success Alert */}
			{notificationSent && (
				<Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800/50 shadow-md">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
						</div>
						<AlertDescription className="text-green-800 dark:text-green-300 font-medium">
							Winner notification sent successfully! The winner has been
							notified about their victory.
						</AlertDescription>
					</div>
				</Alert>
			)}

			{/* Enhanced Header */}
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
						<div className="h-16 w-16 rounded-full bg-gradient-to-br from-app-primary to-app-secondary flex items-center justify-center shadow-lg shadow-app-primary/20">
							<Trophy className="h-8 w-8 text-white" />
						</div>
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-3xl font-bold tracking-tight">
									{challenge.name}
								</h1>
								{getStatusBadge(status)}
								{status === "completed" && winner?.isEligible && (
									<Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0">
										<Trophy className="w-3 h-3 mr-1" />
										Has Winner
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground">{challenge.description}</p>
						</div>
					</div>
					<div className="flex gap-2">
						{/* Winner Notification Button */}
						{status === "completed" && winner?.isEligible && (
							<Dialog
								open={notificationDialogOpen}
								onOpenChange={setNotificationDialogOpen}>
								<DialogTrigger asChild>
									<Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md shadow-green-500/20 transition-all hover:shadow-lg hover:shadow-green-500/30">
										<Bell className="w-4 h-4 mr-2" />
										Notify Winner
									</Button>
								</DialogTrigger>
								<DialogContent className="border-2 border-border/50">
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<Crown className="w-5 h-5 text-yellow-500" />
											Send Winner Notification
										</DialogTitle>
										<DialogDescription>
											Send a congratulatory notification to{" "}
											{winner.participant.userName} for winning the challenge.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg shadow-sm">
											<div className="flex items-center gap-2 mb-2">
												<Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
												<span className="font-medium text-yellow-800 dark:text-yellow-500">
													Winner Details
												</span>
											</div>
											<p className="text-sm text-yellow-700 dark:text-yellow-400">
												<strong>{winner.participant.userName}</strong> completed{" "}
												<strong>
													{winner.participant.steps.toLocaleString()}
												</strong>{" "}
												steps and will receive{" "}
												<strong>
													{formatCurrency(challenge.reward.value)}
												</strong>{" "}
												as {challenge.reward.type}.
											</p>
										</div>
										<div className="space-y-2">
											<Label htmlFor="message">Custom Message (Optional)</Label>
											<Textarea
												id="message"
												placeholder="Add a personal congratulatory message..."
												value={notificationMessage}
												onChange={(e) => setNotificationMessage(e.target.value)}
												rows={3}
												className="border-border/50 focus:border-app-primary/50 focus:ring-app-primary/20"
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setNotificationDialogOpen(false)}>
											Cancel
										</Button>
										<Button
											onClick={handleSendWinnerNotification}
											disabled={sendingNotification}
											className="bg-app-primary hover:bg-app-primary/90">
											{sendingNotification ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
													Sending...
												</>
											) : (
												<>
													<Send className="w-4 h-4 mr-2" />
													Send Notification
												</>
											)}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="border-app-primary/20 text-app-primary hover:bg-app-primary/5 hover:text-app-primary hover:border-app-primary/30">
									<Share2 className="w-4 h-4 mr-2" />
									Actions
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel className="flex items-center gap-2">
									<Activity className="h-4 w-4" />
									Challenge Actions
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Download className="w-4 h-4 mr-2" />
									Export Data
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Share2 className="w-4 h-4 mr-2" />
									Share Challenge
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href={`/dashboard/challenges/${challenge.id}/edit`}>
										<Edit className="w-4 h-4 mr-2" />
										Edit Challenge
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600 dark:text-red-400"
									onClick={handleDeleteChallenge}>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete Challenge
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Enhanced Winner Announcement Card */}
			{status === "completed" && winner && (
				<Card
					className={`border-2 shadow-lg overflow-hidden ${
						winner.isEligible
							? "border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20"
							: "border-red-300 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20"
					}`}>
					<CardContent className="p-6">
						{winner.isEligible ? (
							<div className="flex items-center gap-6">
								<div className="relative">
									<Avatar className="h-20 w-20 border-4 border-yellow-400 shadow-lg shadow-yellow-400/20">
										<AvatarImage src={`/placeholder.svg?height=80&width=80`} />
										<AvatarFallback className="bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-800 text-xl font-bold">
											{winner.participant.userName
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -top-3 -right-3 h-12 w-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
										<Crown className="w-6 h-6 text-white" />
									</div>
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<Trophy className="w-6 h-6 text-yellow-600" />
										<h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-500">
											Challenge Winner!
										</h3>
										<Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
									</div>
									<p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">
										{winner.participant.userName}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
										Completed{" "}
										<strong>{winner.participant.steps.toLocaleString()}</strong>{" "}
										steps ({winner.participant.progress.toFixed(1)}% of target)
									</p>
									<div className="flex items-center gap-2">
										<Gift className="w-4 h-4 text-green-600" />
										<p className="text-sm text-green-700 dark:text-green-400 font-medium">
											Reward: {formatCurrency(challenge.reward.value)} (
											{challenge.reward.type})
										</p>
									</div>
								</div>
								<div className="text-center">
									<div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-400/30">
										<Star className="w-8 h-8 text-white" />
									</div>
									<Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-4 py-2 border-0">
										#1 WINNER
									</Badge>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
									<AlertCircle className="w-8 h-8 text-red-500" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-red-800 dark:text-red-400">
										No Eligible Winner
									</h3>
									<p className="text-red-700 dark:text-red-300">
										Top participant{" "}
										<strong>{winner.participant.userName}</strong> did not meet
										the minimum requirement of{" "}
										{challenge.stepsRequired.toLocaleString()} steps.
									</p>
									<p className="text-sm text-red-600 dark:text-red-400">
										They completed {winner.participant.steps.toLocaleString()}{" "}
										steps ({winner.participant.progress.toFixed(1)}% of target)
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Challenge Image */}
			{challenge.image && (
				<Card className="border-2 border-border/50 shadow-md overflow-hidden">
					<CardContent className="p-0">
						<div className="relative">
							<img
								src={challenge.image || "/placeholder.svg?height=300&width=800"}
								alt={challenge.name}
								className="w-full h-64 object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Enhanced Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Participants
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
							<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
							{challenge.participants}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Min required: {challenge.minParticipants}
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completion Rate
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600 dark:text-green-400">
							{completionRate.toFixed(1)}%
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{completedParticipants} of {challenge.participants} completed
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Reward Pool
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
							<Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
							{formatCurrency(challenge.reward.value * challenge.participants)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{formatCurrency(challenge.reward.value)} per completion
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Revenue Generated
						</CardTitle>
						<div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
							<DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
							{formatCurrency(challenge.joiningCost * challenge.participants)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{formatCurrency(challenge.joiningCost)} per participant
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Main Content Tabs */}
			<Card className="border-2 border-border/50 shadow-md hover:shadow-lg transition-all overflow-hidden">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="tabs-fix">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-xl flex items-center gap-2">
								<Activity className="h-5 w-5 text-app-primary" />
								Challenge Details
							</CardTitle>
							<TabsList className="bg-muted/50 p-1">
								<TabsTrigger
									value="overview"
									className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-background">
									Overview
								</TabsTrigger>
								<TabsTrigger
									value="participants"
									className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-background flex items-center gap-1">
									Participants
									{winner?.isEligible && (
										<Crown className="w-3 h-3 text-yellow-500" />
									)}
								</TabsTrigger>
								<TabsTrigger
									value="analytics"
									className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-background">
									Analytics
								</TabsTrigger>
								<TabsTrigger
									value="settings"
									className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-background">
									Settings
								</TabsTrigger>
							</TabsList>
						</div>
						<Separator className="mt-2" />
					</CardHeader>
					<CardContent className="tabs-content-fix">
						<TabsContent value="overview" className="space-y-6 animate-fadeIn">
							<div className="grid gap-6 md:grid-cols-2">
								{/* Enhanced Challenge Details */}
								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Target className="h-5 w-5 text-app-primary" />
											Challenge Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
											<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
												<Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
											</div>
											<div>
												<p className="font-medium">Steps Required</p>
												<p className="text-sm text-muted-foreground">
													{challenge.stepsRequired.toLocaleString()} steps
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
											<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
												<Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
											</div>
											<div>
												<p className="font-medium">Challenge Period</p>
												<p className="text-sm text-muted-foreground">
													{formatDateTime(challenge.startDate)} -{" "}
													{formatDateTime(challenge.endDate)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
											<div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
												<Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
											</div>
											<div>
												<p className="font-medium">Registration Deadline</p>
												<p className="text-sm text-muted-foreground">
													{formatDateTime(challenge.expiryDate)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
											<div
												className={`h-10 w-10 rounded-full flex items-center justify-center ${
													challenge.joiningCost === 0
														? "bg-green-100 dark:bg-green-900/30"
														: "bg-amber-100 dark:bg-amber-900/30"
												}`}>
												<DollarSign
													className={`h-5 w-5 ${
														challenge.joiningCost === 0
															? "text-green-600 dark:text-green-400"
															: "text-amber-600 dark:text-amber-400"
													}`}
												/>
											</div>
											<div>
												<p className="font-medium">Joining Cost</p>
												<p className="text-sm text-muted-foreground">
													{challenge.joiningCost === 0
														? "Free"
														: formatCurrency(challenge.joiningCost)}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Enhanced Provider Information */}
								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Users className="h-5 w-5 text-app-primary" />
											Provider Information
										</CardTitle>
									</CardHeader>
									<CardContent>
										{challenge.provider ? (
											<div className="space-y-4">
												<div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-app-primary/5 to-app-secondary/5 border border-app-primary/20">
													<Avatar className="h-12 w-12">
														<AvatarFallback className="bg-gradient-to-br from-app-primary to-app-secondary text-white">
															{challenge.provider.name
																.split(" ")
																.map((n) => n[0])
																.join("")
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium text-lg">
															{challenge.provider.name}
														</p>
														{challenge.provider.description && (
															<p className="text-sm text-muted-foreground mt-1">
																{challenge.provider.description}
															</p>
														)}
													</div>
												</div>
												<div className="space-y-3">
													<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
														<MapPin className="h-4 w-4 text-muted-foreground" />
														<p className="text-sm">
															{challenge.provider.address}
														</p>
													</div>
													<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
														<Phone className="h-4 w-4 text-muted-foreground" />
														<p className="text-sm">
															{challenge.provider.phone}
														</p>
													</div>
												</div>
											</div>
										) : (
											<div className="text-center py-8">
												<div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
													<AlertCircle className="h-8 w-8 text-muted-foreground/50" />
												</div>
												<p className="text-muted-foreground font-medium">
													No provider assigned
												</p>
												<p className="text-sm text-muted-foreground/70">
													This challenge doesn't have a provider
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Enhanced Reward Details */}
								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Gift className="h-5 w-5 text-app-primary" />
											Reward Details
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800/30">
											<div className="flex items-center gap-3 mb-2">
												<Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
												<div>
													<p className="font-medium text-lg">
														{challenge.reward.name}
													</p>
													<p className="text-sm text-muted-foreground">
														Reward Type: {challenge.reward.type}
													</p>
												</div>
											</div>
										</div>
										<div className="space-y-3">
											<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
												<Trophy className="h-5 w-5 text-muted-foreground" />
												<div>
													<p className="font-medium">Reward Value</p>
													<p className="text-sm text-muted-foreground">
														{formatCurrency(challenge.reward.value)} per
														completion
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
												<BarChart3 className="h-5 w-5 text-muted-foreground" />
												<div>
													<p className="font-medium">Total Distributed</p>
													<p className="text-sm text-muted-foreground">
														{formatCurrency(
															challenge.reward.value * completedParticipants
														)}
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Enhanced Progress Overview */}
								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Activity className="h-5 w-5 text-app-primary" />
											Progress Overview
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30">
											<div className="flex justify-between text-sm mb-2">
												<span className="font-medium">Overall Completion</span>
												<span className="font-bold text-blue-600 dark:text-blue-400">
													{completionRate.toFixed(1)}%
												</span>
											</div>
											<Progress value={completionRate} className="h-3" />
										</div>
										<div className="grid grid-cols-3 gap-4">
											<div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
												<div className="flex items-center justify-center mb-1">
													<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
												</div>
												<p className="text-2xl font-bold text-green-600 dark:text-green-400">
													{completedParticipants}
												</p>
												<p className="text-xs text-green-700 dark:text-green-300">
													Completed
												</p>
											</div>
											<div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
												<div className="flex items-center justify-center mb-1">
													<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
												</div>
												<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
													{challenge.participants - completedParticipants}
												</p>
												<p className="text-xs text-blue-700 dark:text-blue-300">
													In Progress
												</p>
											</div>
											<div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
												<div className="flex items-center justify-center mb-1">
													<Users className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-1" />
												</div>
												<p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
													{challenge.participants}
												</p>
												<p className="text-xs text-gray-700 dark:text-gray-300">
													Total
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent
							value="participants"
							className="space-y-4 animate-fadeIn">
							<Card className="border border-border/50 shadow-sm">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg flex items-center gap-2">
											<Users className="h-5 w-5 text-app-primary" />
											Participants Leaderboard ({challenge.participants})
											{winner?.isEligible && (
												<Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 ml-2">
													<Crown className="w-3 h-3 mr-1" />
													Winner Declared
												</Badge>
											)}
										</CardTitle>
										<Badge
											variant="outline"
											className="bg-app-primary/10 text-app-primary border-app-primary/20">
											{challenge.participantsList.length} participants
										</Badge>
									</div>
									<CardDescription>
										Participants ranked by steps completed
									</CardDescription>
									<Separator className="mt-2" />
								</CardHeader>
								<CardContent>
									{challenge.participantsList.length === 0 ? (
										<div className="text-center py-12">
											<div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
												<Users className="h-8 w-8 text-muted-foreground/50" />
											</div>
											<div>
												<p className="font-medium text-muted-foreground">
													No participants yet
												</p>
												<p className="text-sm text-muted-foreground/70">
													Participants will appear here once they join
												</p>
											</div>
										</div>
									) : (
										<div className="rounded-lg border border-border/50 overflow-hidden">
											<Table>
												<TableHeader>
													<TableRow className="bg-muted/50 hover:bg-muted/50">
														<TableHead className="font-semibold">
															Rank
														</TableHead>
														<TableHead className="font-semibold">
															Participant
														</TableHead>
														<TableHead className="font-semibold">
															Steps Completed
														</TableHead>
														<TableHead className="font-semibold">
															Progress
														</TableHead>
														<TableHead className="font-semibold">
															Join Date
														</TableHead>
														<TableHead className="font-semibold">
															Status
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{challenge.participantsList.map((participant) => {
														const isWinner =
															winner?.isEligible &&
															participant.userId === winner.participant.userId;
														return (
															<TableRow
																key={participant.userId}
																className={`transition-colors ${
																	isWinner
																		? "bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800/30"
																		: "hover:bg-muted/30"
																}`}>
																<TableCell>
																	{getRankBadge(participant.rank, participant)}
																</TableCell>
																<TableCell>
																	<div className="flex items-center gap-3">
																		<div className="relative">
																			<Avatar
																				className={`h-10 w-10 ${
																					isWinner
																						? "border-2 border-yellow-400 shadow-md shadow-yellow-400/20"
																						: ""
																				}`}>
																				<AvatarImage
																					src={`/placeholder.svg?height=40&width=40`}
																				/>
																				<AvatarFallback
																					className={
																						isWinner
																							? "bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-800"
																							: "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-800"
																					}>
																					{participant.userName
																						.split(" ")
																						.map((n) => n[0])
																						.join("")
																						.toUpperCase()}
																				</AvatarFallback>
																			</Avatar>
																			{isWinner && (
																				<div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
																					<Crown className="w-3 h-3 text-white" />
																				</div>
																			)}
																		</div>
																		<div>
																			<p
																				className={`font-medium ${
																					isWinner
																						? "text-yellow-800 dark:text-yellow-500"
																						: ""
																				}`}>
																				{participant.userName}
																				{isWinner && (
																					<span className="ml-2">👑</span>
																				)}
																			</p>
																			<p className="text-sm text-muted-foreground">
																				{participant.userEmail}
																			</p>
																		</div>
																	</div>
																</TableCell>
																<TableCell>
																	<div className="flex items-center gap-2">
																		<Footprints className="h-4 w-4 text-blue-500" />
																		<div>
																			<p
																				className={`font-medium ${
																					isWinner
																						? "text-yellow-800 dark:text-yellow-500"
																						: ""
																				}`}>
																				{participant.steps.toLocaleString()}
																			</p>
																			<p className="text-sm text-muted-foreground">
																				of{" "}
																				{challenge.stepsRequired.toLocaleString()}
																			</p>
																		</div>
																	</div>
																</TableCell>
																<TableCell>
																	<div className="space-y-2">
																		<div className="flex justify-between text-sm">
																			<span
																				className={
																					isWinner
																						? "text-yellow-800 dark:text-yellow-500 font-medium"
																						: ""
																				}>
																				{participant.progress.toFixed(1)}%
																			</span>
																		</div>
																		<Progress
																			value={Math.min(
																				participant.progress,
																				100
																			)}
																			className={`h-2 ${
																				isWinner
																					? "bg-yellow-100 dark:bg-yellow-900/30"
																					: ""
																			}`}
																		/>
																	</div>
																</TableCell>
																<TableCell>
																	<div className="flex items-center gap-2">
																		<Calendar className="h-4 w-4 text-muted-foreground" />
																		<p className="text-sm">
																			{formatDateTime(participant.joinDate)}
																		</p>
																	</div>
																</TableCell>
																<TableCell>
																	{getParticipantStatus(participant)}
																</TableCell>
															</TableRow>
														);
													})}
												</TableBody>
											</Table>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="analytics" className="space-y-6 animate-fadeIn">
							<div className="grid gap-6 md:grid-cols-2">
								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<BarChart3 className="h-5 w-5 text-app-primary" />
											Performance Metrics
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">
													Total Steps Recorded
												</span>
												<span className="font-bold text-blue-600 dark:text-blue-400">
													{challenge.participantsList
														.reduce((sum, p) => sum + p.steps, 0)
														.toLocaleString()}
												</span>
											</div>
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">
													Average Steps per Participant
												</span>
												<span className="font-bold text-green-600 dark:text-green-400">
													{challenge.participants > 0
														? Math.round(
																challenge.participantsList.reduce(
																	(sum, p) => sum + p.steps,
																	0
																) / challenge.participants
														  ).toLocaleString()
														: "0"}
												</span>
											</div>
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">Completion Rate</span>
												<span className="font-bold text-purple-600 dark:text-purple-400">
													{completionRate.toFixed(1)}%
												</span>
											</div>
										</div>
										{challenge.participantsList.length > 0 && (
											<div className="pt-4 border-t">
												<p className="font-medium mb-3 flex items-center gap-2">
													Top Performer
													{winner?.isEligible && (
														<Crown className="w-4 h-4 text-yellow-500" />
													)}
												</p>
												<div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-app-primary/5 to-app-secondary/5 border border-app-primary/20">
													<Avatar className="h-8 w-8">
														<AvatarFallback className="bg-gradient-to-br from-app-primary to-app-secondary text-white text-xs">
															{challenge.participantsList[0].userName
																.split(" ")
																.map((n) => n[0])
																.join("")
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<span className="text-sm font-medium">
															{challenge.participantsList[0].userName}
														</span>
													</div>
													<Badge
														className={`${
															winner?.isEligible
																? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300"
																: "bg-gray-100 text-gray-800 border-gray-300"
														}`}>
														{challenge.participantsList[0].steps.toLocaleString()}{" "}
														steps
													</Badge>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								<Card className="border border-border/50 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<DollarSign className="h-5 w-5 text-app-primary" />
											Financial Summary
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">Total Revenue</span>
												<span className="font-bold text-green-600 dark:text-green-400">
													{formatCurrency(
														challenge.joiningCost * challenge.participants
													)}
												</span>
											</div>
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">Rewards Distributed</span>
												<span className="font-bold text-blue-600 dark:text-blue-400">
													{formatCurrency(
														challenge.reward.value * completedParticipants
													)}
												</span>
											</div>
											<div className="flex justify-between p-3 rounded-lg bg-muted/30">
												<span className="font-medium">Pending Rewards</span>
												<span className="font-bold text-amber-600 dark:text-amber-400">
													{formatCurrency(
														challenge.reward.value *
															(challenge.participants - completedParticipants)
													)}
												</span>
											</div>
										</div>
										<div className="pt-4 border-t">
											<div className="flex justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30">
												<span className="font-medium text-green-800 dark:text-green-300">
													Net Revenue
												</span>
												<span className="font-bold text-green-600 dark:text-green-400">
													{formatCurrency(
														challenge.joiningCost * challenge.participants -
															challenge.reward.value * completedParticipants
													)}
												</span>
											</div>
										</div>
										{winner?.isEligible && (
											<div className="pt-4 border-t">
												<div className="flex justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800/30">
													<span className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
														<Crown className="w-4 h-4" />
														Winner Reward
													</span>
													<span className="font-bold text-yellow-600 dark:text-yellow-400">
														{formatCurrency(challenge.reward.value)}
													</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="settings" className="space-y-4 animate-fadeIn">
							<Card className="border border-border/50 shadow-sm">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										<Edit className="h-5 w-5 text-app-primary" />
										Challenge Settings
									</CardTitle>
									<CardDescription>
										Manage challenge configuration and settings
									</CardDescription>
									<Separator className="mt-2" />
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<Button
											asChild
											className="bg-app-primary hover:bg-app-primary/90 h-12">
											<Link href={`/dashboard/challenges/${challenge.id}/edit`}>
												<Edit className="w-4 h-4 mr-2" />
												Edit Challenge Details
											</Link>
										</Button>
										<Button
											variant="outline"
											className="h-12 border-app-primary/20 text-app-primary hover:bg-app-primary/5">
											<Download className="w-4 h-4 mr-2" />
											Export Participant Data
										</Button>
										<Button
											variant="outline"
											className="h-12 border-app-primary/20 text-app-primary hover:bg-app-primary/5">
											<Share2 className="w-4 h-4 mr-2" />
											Share Challenge Link
										</Button>
										<Button
											variant="destructive"
											onClick={handleDeleteChallenge}
											className="h-12">
											<Trash2 className="w-4 h-4 mr-2" />
											Delete Challenge
										</Button>
									</div>

									<div className="pt-4 border-t">
										<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
											<Eye className="h-5 w-5 text-app-primary" />
											Quick Actions
										</h3>
										<div className="grid gap-3 md:grid-cols-3">
											<Button
												variant="outline"
												size="sm"
												className="justify-start">
												<UserCheck className="w-4 h-4 mr-2" />
												View All Participants
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="justify-start">
												<BarChart3 className="w-4 h-4 mr-2" />
												Generate Report
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="justify-start">
												<Bell className="w-4 h-4 mr-2" />
												Send Announcement
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</CardContent>
				</Tabs>
			</Card>
		</div>
	);
}
