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
import { API_URL } from "@/lib/config.json";

interface RewardType {
	id: number;
	name: string;
}

interface EditRewardTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rewardType: RewardType | null;
	onSuccess: () => void;
}

export function EditRewardTypeDialog({
	open,
	onOpenChange,
	rewardType,
	onSuccess,
}: EditRewardTypeDialogProps) {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	useEffect(() => {
		if (rewardType) {
			setName(rewardType.name);
		}
	}, [rewardType]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!rewardType) return;

		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/rewardType/${rewardType.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				onOpenChange(false);
			} else {
				alert(data.message || "Failed to update reward type");
			}
		} catch (error) {
			console.error("Error updating reward type:", error);
			alert("Failed to update reward type");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Reward Type</DialogTitle>
					<DialogDescription>Update the reward type name</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Type Name *</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Cash, Points, Gift Card"
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
							{loading ? "Updating..." : "Update Type"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
