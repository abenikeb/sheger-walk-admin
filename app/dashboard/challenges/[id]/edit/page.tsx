"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
	reward: {
		id: number;
		name: string;
		value: number;
		type: string;
	};
}

export default function EditChallengePage() {
	const params = useParams();
	const router = useRouter();
	const challengeId = params.id as string;

	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [providers, setProviders] = useState<ChallengeProvider[]>([]);
	const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		challengeProviderId: "",
		joiningCost: "",
		startDate: undefined as Date | undefined,
		endDate: undefined as Date | undefined,
		expiryDate: undefined as Date | undefined,
		stepsRequired: "",
		minParticipants: "",
		image: "",
		// Reward fields
		rewardName: "",
		rewardTypeId: "",
		rewardValue: "",
	});

	useEffect(() => {
		if (challengeId) {
			fetchChallengeDetails();
			fetchProviders();
			fetchRewardTypes();
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
				const challenge = data.challenge;
				setChallenge(challenge);

				// Populate form with existing data
				setFormData({
					name: challenge.name,
					description: challenge.description,
					challengeProviderId: challenge.provider
						? challenge.provider.id.toString()
						: "",
					joiningCost: challenge.joiningCost.toString(),
					startDate: new Date(challenge.startDate),
					endDate: new Date(challenge.endDate),
					expiryDate: new Date(challenge.expiryDate),
					stepsRequired: challenge.stepsRequired.toString(),
					minParticipants: challenge.minParticipants.toString(),
					image: challenge.image || "",
					rewardName: challenge.reward.name,
					rewardTypeId: "", // We'll need to find this from reward types
					rewardValue: challenge.reward.value.toString(),
				});
			} else {
				setError(data.message || "Failed to fetch challenge details");
			}
		} catch (error) {
			console.error("Error fetching challenge:", error);
			setError("Failed to fetch challenge details");
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

				// Find and set the reward type ID based on the challenge's reward type
				if (challenge) {
					const rewardType = data.find(
						(type: RewardType) => type.name === challenge.reward.type
					);
					if (rewardType) {
						setFormData((prev) => ({
							...prev,
							rewardTypeId: rewardType.id.toString(),
						}));
					}
				}
			}
		} catch (error) {
			console.error("Error fetching reward types:", error);
		}
	};

	const validateForm = () => {
		const errors: string[] = [];

		if (!formData.name.trim()) errors.push("Challenge name is required");
		if (!formData.description.trim()) errors.push("Description is required");
		if (!formData.startDate) errors.push("Start date is required");
		if (!formData.endDate) errors.push("End date is required");
		if (!formData.expiryDate) errors.push("Expiry date is required");
		if (!formData.stepsRequired || Number(formData.stepsRequired) <= 0)
			errors.push("Valid steps required is needed");
		if (!formData.minParticipants || Number(formData.minParticipants) <= 0)
			errors.push("Valid minimum participants is needed");
		if (!formData.rewardName.trim()) errors.push("Reward name is required");
		if (!formData.rewardTypeId) errors.push("Reward type is required");
		if (!formData.rewardValue || Number(formData.rewardValue) <= 0)
			errors.push("Valid reward value is needed");

		if (
			formData.startDate &&
			formData.endDate &&
			formData.startDate >= formData.endDate
		) {
			errors.push("End date must be after start date");
		}

		if (
			formData.startDate &&
			formData.expiryDate &&
			formData.expiryDate >= formData.startDate
		) {
			errors.push("Expiry date must be before start date");
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		const validationErrors = validateForm();
		if (validationErrors.length > 0) {
			setError(validationErrors.join(", "));
			return;
		}

		setSaving(true);

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/${challengeId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name,
						description: formData.description,
						challengeProviderId: formData.challengeProviderId || null,
						joiningCost: Number(formData.joiningCost),
						startDate: formData.startDate?.toISOString(),
						endDate: formData.endDate?.toISOString(),
						expiryDate: formData.expiryDate?.toISOString(),
						stepsRequired: Number(formData.stepsRequired),
						minParticipants: Number(formData.minParticipants),
						image: formData.image,
						rewardId: challenge?.reward.id, // Keep existing reward ID for now
					}),
				}
			);

			const data = await response.json();

			if (response.ok) {
				setSuccess(true);
				setTimeout(() => {
					router.push(`/dashboard/challenges/${challengeId}`);
				}, 2000);
			} else {
				setError(data.message || "Failed to update challenge");
			}
		} catch (error) {
			console.error("Error updating challenge:", error);
			setError("Failed to update challenge");
		} finally {
			setSaving(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString()} ETB`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading challenge details...</p>
				</div>
			</div>
		);
	}

	if (!challenge) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">Challenge Not Found</h2>
					<p className="text-muted-foreground mb-4">
						The challenge you're trying to edit doesn't exist.
					</p>
					<Button asChild>
						<Link href="/dashboard/challenges">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Challenges
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="sm" asChild>
						<Link href={`/dashboard/challenges/${challengeId}`}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Challenge
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Edit Challenge
						</h1>
						<p className="text-muted-foreground">
							Update challenge details and settings
						</p>
					</div>
				</div>
			</div>

			{/* Alerts */}
			{error && (
				<Alert variant="destructive">
					<X className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className="border-green-200 bg-green-50">
					<Save className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800">
						Challenge updated successfully! Redirecting to challenge details...
					</AlertDescription>
				</Alert>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>Update the core challenge details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Challenge Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="e.g., 10K Steps Challenge"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="provider">Challenge Provider</Label>
								<Select
									value={formData.challengeProviderId}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											challengeProviderId: value,
										}))
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select provider (optional)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="0">No Provider</SelectItem>
										{providers.map((provider) => (
											<SelectItem
												key={provider.id}
												value={provider.id.toString()}>
												{provider.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Describe the challenge objectives and rules..."
								required
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="joiningCost">Joining Cost (ETB) *</Label>
								<Input
									id="joiningCost"
									type="number"
									min="0"
									step="0.01"
									value={formData.joiningCost}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											joiningCost: e.target.value,
										}))
									}
									placeholder="0"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="stepsRequired">Steps Required *</Label>
								<Input
									id="stepsRequired"
									type="number"
									min="1"
									value={formData.stepsRequired}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											stepsRequired: e.target.value,
										}))
									}
									placeholder="10000"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minParticipants">Min Participants *</Label>
								<Input
									id="minParticipants"
									type="number"
									min="1"
									value={formData.minParticipants}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											minParticipants: e.target.value,
										}))
									}
									placeholder="10"
									required
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Schedule */}
				<Card>
					<CardHeader>
						<CardTitle>Schedule</CardTitle>
						<CardDescription>Set the challenge timeline</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label>Start Date *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!formData.startDate && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.startDate
												? format(formData.startDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.startDate}
											onSelect={(date) =>
												setFormData((prev) => ({ ...prev, startDate: date }))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="space-y-2">
								<Label>End Date *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!formData.endDate && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.endDate
												? format(formData.endDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.endDate}
											onSelect={(date) =>
												setFormData((prev) => ({ ...prev, endDate: date }))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="space-y-2">
								<Label>Registration Deadline *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!formData.expiryDate && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.expiryDate
												? format(formData.expiryDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.expiryDate}
											onSelect={(date) =>
												setFormData((prev) => ({ ...prev, expiryDate: date }))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Reward Information */}
				<Card>
					<CardHeader>
						<CardTitle>Reward Details</CardTitle>
						<CardDescription>Configure the challenge rewards</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="rewardName">Reward Name *</Label>
								<Input
									id="rewardName"
									value={formData.rewardName}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											rewardName: e.target.value,
										}))
									}
									placeholder="e.g., Completion Bonus"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rewardType">Reward Type *</Label>
								<Select
									value={formData.rewardTypeId}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, rewardTypeId: value }))
									}
									required>
									<SelectTrigger>
										<SelectValue placeholder="Select reward type" />
									</SelectTrigger>
									<SelectContent>
										{rewardTypes.map((type) => (
											<SelectItem key={type.id} value={type.id.toString()}>
												{type.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rewardValue">Reward Value (ETB) *</Label>
								<Input
									id="rewardValue"
									type="number"
									min="0"
									step="0.01"
									value={formData.rewardValue}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											rewardValue: e.target.value,
										}))
									}
									placeholder="100"
									required
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Challenge Image */}
				<Card>
					<CardHeader>
						<CardTitle>Challenge Image</CardTitle>
						<CardDescription>Optional image for the challenge</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="image">Image URL</Label>
							<Input
								id="image"
								value={formData.image}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, image: e.target.value }))
								}
								placeholder="https://example.com/challenge-image.jpg"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex gap-4">
					<Button type="submit" disabled={saving}>
						{saving ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Updating...
							</>
						) : (
							<>
								<Save className="w-4 h-4 mr-2" />
								Update Challenge
							</>
						)}
					</Button>
					<Button type="button" variant="outline" asChild>
						<Link href={`/dashboard/challenges/${challengeId}`}>Cancel</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
