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
import { Textarea } from "@/components/ui/textarea";
import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

interface CreateProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreateProviderDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreateProviderDialogProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		phone: "",
		description: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/challengeProvider`,
				{
					method: "POST",
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
				setFormData({ name: "", address: "", phone: "", description: "" });
			} else {
				alert(data.message || "Failed to create provider");
			}
		} catch (error) {
			console.error("Error creating provider:", error);
			alert("Failed to create provider");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Provider</DialogTitle>
					<DialogDescription>
						Add a new challenge provider organization
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
							{loading ? "Creating..." : "Create Provider"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
