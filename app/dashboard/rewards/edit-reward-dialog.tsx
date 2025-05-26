"use client";

import type React from "react";

import { useState, useEffect } from "react";

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

interface RewardType {
	id: number;
	name: string;
}

interface Reward {
	id: number;
	name: string;
	value: number;
	rewardTypeId: number;
	type: RewardType;
}

interface EditRewardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reward: Reward | null;
	rewardTypes: RewardType[];
	onSuccess: () => void;
}

export function EditRewardDialog({
	open,
	onOpenChange,
	reward,
	rewardTypes,
	onSuccess,
}: EditRewardDialogProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		rewardTypeId: "",
		value: "",
	});

	useEffect(() => {
		if (reward) {
			setFormData({
				name: reward.name,
				rewardTypeId: reward.rewardTypeId.toString(),
				value: reward.value.toString(),
			});
		}
	}, [reward]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!reward) return;

		setLoading(true);

		try {
			const response = await fetch(
				`http://localhost:3001/api/rewards/${reward.id}`,
				{
					method: "PUT",
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
			} else {
				alert(data.message || "Failed to update reward");
			}
		} catch (error) {
			console.error("Error updating reward:", error);
			alert("Failed to update reward");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Reward</DialogTitle>
					<DialogDescription>Update reward details and value</DialogDescription>
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
							{loading ? "Updating..." : "Update Reward"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
