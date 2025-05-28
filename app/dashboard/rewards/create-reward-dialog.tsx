"use client";

import type React from "react";

import { useState } from "react";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/config.json";

interface RewardType {
	id: number;
	name: string;
}

interface CreateRewardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rewardTypes: RewardType[];
	onSuccess: () => void;
}

export function CreateRewardDialog({
	open,
	onOpenChange,
	rewardTypes,
	onSuccess,
}: CreateRewardDialogProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		rewardTypeId: "",
		value: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/rewards`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name,
						rewardTypeId: Number(formData.rewardTypeId),
						value: Number(formData.value),
					}),
				}
			);

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				onOpenChange(false);
				setFormData({ name: "", rewardTypeId: "", value: "" });
			} else {
				alert(data.message || "Failed to create reward");
			}
		} catch (error) {
			console.error("Error creating reward:", error);
			alert("Failed to create reward");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Reward</DialogTitle>
					<DialogDescription>
						Add a new reward with specified value and type
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Reward Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
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
						<Label htmlFor="value">Value (ETB) *</Label>
						<Input
							id="value"
							type="number"
							min="0"
							step="0.01"
							value={formData.value}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, value: e.target.value }))
							}
							placeholder="100"
							required
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Reward"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
