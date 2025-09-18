"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Calendar,
	Clock,
	Users,
	MapPin,
	Phone,
	Trophy,
	Coins,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from "@/lib/config.json";

interface Challenge {
	id: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	expiryDate: string;
	status: string;
	participantsCount: number;
	stepsRequired: number;
	joiningCost: number;
	minParticipants: number;
	image?: string;
	reward: {
		id: number;
		name: string;
		value: number;
		type: string;
	};
	createdAt: string;
}

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
	logoUrl?: string;
	challengesCount: number;
}

export default function ProviderChallengesPage() {
	const params = useParams();
	const router = useRouter();
	const providerId = params.id as string;

	const [provider, setProvider] = useState<ChallengeProvider | null>(null);
	const [challenges, setChallenges] = useState<Challenge[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (providerId) {
			fetchProviderAndChallenges();
		}
	}, [providerId]);

	const fetchProviderAndChallenges = async () => {
		try {
			setLoading(true);

			// Fetch provider details
			const providerResponse = await fetch(
				`${API_URL}/api/challenges/challengeProvider/${providerId}`
			);

			if (providerResponse.ok) {
				const providerData = await providerResponse.json();
				setProvider(providerData);
			}

			// Fetch challenges for this provider
			const challengesResponse = await fetch(
				`${API_URL}/api/challenges/provider/${providerId}/challenges`
			);

			if (challengesResponse.ok) {
				const challengesData = await challengesResponse.json();
				setChallenges(challengesData || []);
			}
		} catch (error) {
			console.error("Error fetching provider challenges:", error);
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

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-100 text-green-800";
			case "upcoming":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Loading provider challenges...</p>
			</div>
		);
	}

	if (!provider) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-muted-foreground">Provider not found</p>
				<Button onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Providers
				</Button>
			</div>

			{/* Provider Info */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						{provider.logoUrl ? (
							<img
								src={
									`${API_URL}${provider.logoUrl}` ||
									"/placeholder.svg?height=300&width=800"
								}
								alt={provider.name.substring(0, 2).toUpperCase()}
								className="h-20 w-20 rounded-full"
							/>
						) : (
							<Avatar className="h-10 w-10">
								<AvatarImage
									src={provider.logoUrl || "/placeholder.svg"}
									alt={`${provider.name} logo`}
								/>
								<AvatarFallback>
									{provider.name.substring(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						)}
						<div className="flex-1">
							<CardTitle className="text-2xl">{provider.name}</CardTitle>
							<CardDescription className="text-base">
								{provider.description || "No description available"}
							</CardDescription>
							<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-1">
									<MapPin className="h-4 w-4" />
									{provider.address}
								</div>
								<div className="flex items-center gap-1">
									<Phone className="h-4 w-4" />
									{provider.phone}
								</div>
							</div>
						</div>
						<div className="text-right">
							<div className="text-2xl font-bold">{challenges.length}</div>
							<div className="text-sm text-muted-foreground">
								Total Challenges
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Challenges */}
			<Card>
				<CardHeader>
					<CardTitle>Challenges by {provider.name}</CardTitle>
					<CardDescription>
						All challenges created and managed by this provider
					</CardDescription>
				</CardHeader>
				<CardContent>
					{challenges.length === 0 ? (
						<div className="text-center py-12">
							<Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">No challenges found</h3>
							<p className="text-muted-foreground">
								This provider hasn't created any challenges yet.
							</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{challenges.map((challenge) => (
								<Card
									key={challenge.id}
									className="hover:shadow-md transition-shadow">
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<CardTitle className="text-lg line-clamp-2">
												{challenge.title}
											</CardTitle>
											<Badge className={getStatusColor(challenge.status)}>
												{challenge.status}
											</Badge>
										</div>
										<CardDescription className="line-clamp-3">
											{challenge.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-2 text-sm">
											<div className="flex items-center gap-2 text-muted-foreground">
												<Calendar className="h-4 w-4" />
												<span>
													{formatDate(challenge.startDate)} -{" "}
													{formatDate(challenge.endDate)}
												</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Users className="h-4 w-4" />
												<span>
													{challenge.participantsCount} /{" "}
													{challenge.minParticipants}+ participants
												</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Coins className="h-4 w-4" />
												<span>{challenge.joiningCost} points to join</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Trophy className="h-4 w-4" />
												<span>
													{challenge.reward.name} ({challenge.reward.value}{" "}
													{challenge.reward.type})
												</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Clock className="h-4 w-4" />
												<span>Created {formatDate(challenge.createdAt)}</span>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
