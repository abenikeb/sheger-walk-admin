"use client";

import type React from "react";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BEARER_TOKEN, API_URL } from "@/lib/config.json";

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
}

interface ManageProvidersDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providers: ChallengeProvider[];
	onSuccess: () => void;
}

export function ManageProvidersDialog({
	open,
	onOpenChange,
	providers,
	onSuccess,
}: ManageProvidersDialogProps) {
	const [loading, setLoading] = useState(false);
	const [editingProvider, setEditingProvider] =
		useState<ChallengeProvider | null>(null);
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
			const url = editingProvider
				? `${API_URL}/api/challenges/challengeProvider/${editingProvider.id}`
				: `${API_URL}/api/challenges/challengeProvider`;

			const method = editingProvider ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				resetForm();
			} else {
				alert(data.message || "Failed to save provider");
			}
		} catch (error) {
			console.error("Error saving provider:", error);
			alert("Failed to save provider");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (provider: ChallengeProvider) => {
		setEditingProvider(provider);
		setFormData({
			name: provider.name,
			address: provider.address,
			phone: provider.phone,
			description: provider.description || "",
		});
	};

	const handleDelete = async (providerId: number) => {
		if (!confirm("Are you sure you want to delete this provider?")) return;

		try {
			setLoading(true);
			const response = await fetch(
				`${API_URL}/api/challenges/providers/${providerId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${BEARER_TOKEN}`,
					},
				}
			);

			if (response.ok) {
				toast({
					title: "Success",
					description: "Provider deleted successfully",
				});
				onSuccess();
			} else {
				const result = await response.json();
				toast({
					title: "Error",
					description: result.message || "Failed to delete provider",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error deleting provider:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// const handleDelete = async (providerId: number) => {
	// 	if (!confirm("Are you sure you want to delete this provider?")) return;

	// 	try {
	// 		const response = await fetch(
	// 			`${API_URL}/api/challenges/challengeProvider/${providerId}`,
	// 			{
	// 				method: "DELETE",
	// 			}
	// 		);

	// 		if (response.ok) {
	// 			onSuccess();
	// 		} else {
	// 			alert("Failed to delete provider");
	// 		}
	// 	} catch (error) {
	// 		console.error("Error deleting provider:", error);
	// 		alert("Failed to delete provider");
	// 	}
	// };

	const resetForm = () => {
		setEditingProvider(null);
		setFormData({
			name: "",
			address: "",
			phone: "",
			description: "",
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Challenge Providers</DialogTitle>
					<DialogDescription>
						Add, edit, or remove challenge providers
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Form */}
					<Card>
						<CardHeader>
							<CardTitle>
								{editingProvider ? "Edit Provider" : "Add New Provider"}
							</CardTitle>
						</CardHeader>
						<CardContent>
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
											setFormData((prev) => ({
												...prev,
												address: e.target.value,
											}))
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
											setFormData((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
										placeholder="e.g., +1-234-567-8900"
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
									/>
								</div>

								<div className="flex gap-2">
									<Button type="submit" disabled={loading}>
										{loading
											? "Saving..."
											: editingProvider
											? "Update Provider"
											: "Add Provider"}
									</Button>
									{editingProvider && (
										<Button type="button" variant="outline" onClick={resetForm}>
											Cancel Edit
										</Button>
									)}
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Providers List */}
					<Card>
						<CardHeader>
							<CardTitle>Existing Providers ({providers.length})</CardTitle>
						</CardHeader>
						<CardContent>
							{providers.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
									No providers found
								</p>
							) : (
								<div className="space-y-2 max-h-96 overflow-y-auto">
									{providers.map((provider) => (
										<div key={provider.id} className="border rounded-lg p-3">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h4 className="font-medium">{provider.name}</h4>
													<p className="text-sm text-muted-foreground">
														{provider.address}
													</p>
													<p className="text-sm text-muted-foreground">
														{provider.phone}
													</p>
													{provider.description && (
														<p className="text-sm text-muted-foreground mt-1">
															{provider.description}
														</p>
													)}
												</div>
												<div className="flex gap-1">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEdit(provider)}>
														<Pencil className="h-3 w-3" />
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleDelete(provider.id)}>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
