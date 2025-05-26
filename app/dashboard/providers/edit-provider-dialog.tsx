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
import { Textarea } from "@/components/ui/textarea";

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
}

interface EditProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	provider: ChallengeProvider | null;
	onSuccess: () => void;
}

export function EditProviderDialog({
	open,
	onOpenChange,
	provider,
	onSuccess,
}: EditProviderDialogProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		phone: "",
		description: "",
	});

	useEffect(() => {
		if (provider) {
			setFormData({
				name: provider.name,
				address: provider.address,
				phone: provider.phone,
				description: provider.description || "",
			});
		}
	}, [provider]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!provider) return;

		setLoading(true);

		try {
			const response = await fetch(
				`http://localhost:3001/api/challenges/challengeProvider/${provider.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				onOpenChange(false);
			} else {
				alert(data.message || "Failed to update provider");
			}
		} catch (error) {
			console.error("Error updating provider:", error);
			alert("Failed to update provider");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Provider</DialogTitle>
					<DialogDescription>
						Update provider information and details
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Provider Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="e.g., FitCorp"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address">Address *</Label>
						<Input
							id="address"
							value={formData.address}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, address: e.target.value }))
							}
							placeholder="e.g., 123 Main St, City, State"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Phone *</Label>
						<Input
							id="phone"
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, phone: e.target.value }))
							}
							placeholder="e.g., +251-911-123456"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Optional description of the provider..."
							rows={3}
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
							{loading ? "Updating..." : "Update Provider"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
