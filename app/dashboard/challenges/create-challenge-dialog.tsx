"use client";

import type React from "react";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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

interface CreateChallengeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providers: ChallengeProvider[];
	rewardTypes: RewardType[];
	onSuccess: () => void;
}

export function CreateChallengeDialog({
	open,
	onOpenChange,
	providers,
	rewardTypes,
	onSuccess,
}: CreateChallengeDialogProps) {
	const [loading, setLoading] = useState(false);
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/api/challenges/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					challengeProviderId: formData.challengeProviderId || null,
					joiningCost: Number(formData.joiningCost),
					stepsRequired: Number(formData.stepsRequired),
					minParticipants: Number(formData.minParticipants),
					rewardTypeId: Number(formData.rewardTypeId),
					rewardValue: Number(formData.rewardValue),
					startDate: formData.startDate?.toISOString(),
					endDate: formData.endDate?.toISOString(),
					expiryDate: formData.expiryDate?.toISOString(),
				}),
			});

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				onOpenChange(false);
				// Reset form
				setFormData({
					name: "",
					description: "",
					challengeProviderId: "",
					joiningCost: "",
					startDate: undefined,
					endDate: undefined,
					expiryDate: undefined,
					stepsRequired: "",
					minParticipants: "",
					image: "",
					rewardName: "",
					rewardTypeId: "",
					rewardValue: "",
				});
			} else {
				alert(data.message || "Failed to create challenge");
			}
		} catch (error) {
			console.error("Error creating challenge:", error);
			alert("Failed to create challenge");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Challenge</DialogTitle>
					<DialogDescription>
						Create a new challenge with rewards for participants
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Basic Information</h3>

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
								<Label htmlFor="joiningCost">Joining Cost ($) *</Label>
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
					</div>

					{/* Dates */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Schedule</h3>

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
								<Label>Expiry Date *</Label>
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
					</div>

					{/* Reward Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Reward Details</h3>

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
								<Label htmlFor="rewardValue">Reward Value *</Label>
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
					</div>

					{/* Image Upload */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Challenge Image</h3>
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
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Challenge"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
