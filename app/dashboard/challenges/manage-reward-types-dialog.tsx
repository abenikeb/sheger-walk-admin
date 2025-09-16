"use client";

import type React from "react";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL, BEARER_TOKEN } from "@/lib/config.json";

interface RewardType {
	id: number;
	name: string;
}

interface ManageRewardTypesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rewardTypes: RewardType[];
	onSuccess: () => void;
}

export function ManageRewardTypesDialog({
	open,
	onOpenChange,
	rewardTypes,
	onSuccess,
}: ManageRewardTypesDialogProps) {
	const [loading, setLoading] = useState(false);
	const [editingType, setEditingType] = useState<RewardType | null>(null);
	const [formData, setFormData] = useState({
		name: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = editingType
				? `${API_URL}/api/challenges/rewardType/${editingType.id}`
				: `${API_URL}/api/challenges/rewardType`;

			const method = editingType ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${BEARER_TOKEN}`,
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				resetForm();
			} else {
				alert(data.message || "Failed to save reward type");
			}
		} catch (error) {
			console.error("Error saving reward type:", error);
			alert("Failed to save reward type");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (type: RewardType) => {
		setEditingType(type);
		setFormData({
			name: type.name,
		});
	};

	const handleDelete = async (typeId: number) => {
		if (!confirm("Are you sure you want to delete this reward type?")) return;

		try {
			const response = await fetch(
				`${API_URL}/api/challenges/rewardType/${typeId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${BEARER_TOKEN}`,
					},
				}
			);

			const data = await response.json();

			if (response.ok) {
				onSuccess();
			} else {
				alert(data.message || "Failed to delete reward type");
			}
		} catch (error) {
			console.error("Error deleting reward type:", error);
			alert("Failed to delete reward type");
		}
	};

	const resetForm = () => {
		setEditingType(null);
		setFormData({
			name: "",
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Manage Reward Types</DialogTitle>
					<DialogDescription>
						Add, edit, or remove reward types (e.g., Points, Cash, Gift Cards)
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Form */}
					<Card>
						<CardHeader>
							<CardTitle>
								{editingType ? "Edit Reward Type" : "Add New Reward Type"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Reward Type Name *</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, name: e.target.value }))
										}
										placeholder="e.g., Points, Cash, Gift Card"
										required
									/>
								</div>

								<div className="flex gap-2">
									<Button type="submit" disabled={loading}>
										{loading
											? "Saving..."
											: editingType
											? "Update Type"
											: "Add Type"}
									</Button>
									{editingType && (
										<Button type="button" variant="outline" onClick={resetForm}>
											Cancel Edit
										</Button>
									)}
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Reward Types List */}
					<Card>
						<CardHeader>
							<CardTitle>Existing Types ({rewardTypes.length})</CardTitle>
						</CardHeader>
						<CardContent>
							{rewardTypes.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
									No reward types found
								</p>
							) : (
								<div className="space-y-2 max-h-64 overflow-y-auto">
									{rewardTypes.map((type) => (
										<div
											key={type.id}
											className="flex items-center justify-between border rounded-lg p-3">
											<span className="font-medium">{type.name}</span>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleEdit(type)}>
													<Pencil className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(type.id)}>
													<Trash2 className="h-3 w-3" />
												</Button>
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
// "use client";

// import type React from "react";

// import { useState } from "react";
// import { Pencil, Trash2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BEARER_TOKEN, API_URL } from "@/lib/config.json";

// interface RewardType {
// 	id: number;
// 	name: string;
// }

// interface ManageRewardTypesDialogProps {
// 	open: boolean;
// 	onOpenChange: (open: boolean) => void;
// 	rewardTypes: RewardType[];
// 	onSuccess: () => void;
// }

// export function ManageRewardTypesDialog({
// 	open,
// 	onOpenChange,
// 	rewardTypes,
// 	onSuccess,
// }: ManageRewardTypesDialogProps) {
// 	const [loading, setLoading] = useState(false);
// 	const [editingType, setEditingType] = useState<RewardType | null>(null);
// 	const [formData, setFormData] = useState({
// 		name: "",
// 	});

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);

// 		try {
// 			const url = editingType
// 				? `${API_URL}/api/challenges/rewardType/${editingType.id}`
// 				: `${API_URL}/api/challenges/rewardType`;

// 			const method = editingType ? "PUT" : "POST";

// 			const response = await fetch(url, {
// 				method,
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${BEARER_TOKEN}`,
// 				},
// 				body: JSON.stringify(formData),
// 			});

// 			const data = await response.json();

// 			if (response.ok) {
// 				onSuccess();
// 				resetForm();
// 			} else {
// 				alert(data.message || "Failed to save reward type");
// 			}
// 		} catch (error) {
// 			console.error("Error saving reward type:", error);
// 			alert("Failed to save reward type");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleEdit = (type: RewardType) => {
// 		setEditingType(type);
// 		setFormData({
// 			name: type.name,
// 		});
// 	};

// 	const handleDelete = async (typeId: number) => {
// 		if (!confirm("Are you sure you want to delete this reward type?")) return;

// 		try {
// 			const response = await fetch(`/api/challenges/rewardType/${typeId}`, {
// 				method: "DELETE",
// 			});

// 			if (response.ok) {
// 				onSuccess();
// 			} else {
// 				alert("Failed to delete reward type");
// 			}
// 		} catch (error) {
// 			console.error("Error deleting reward type:", error);
// 			alert("Failed to delete reward type");
// 		}
// 	};

// 	const resetForm = () => {
// 		setEditingType(null);
// 		setFormData({
// 			name: "",
// 		});
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent className="max-w-2xl">
// 				<DialogHeader>
// 					<DialogTitle>Manage Reward Types</DialogTitle>
// 					<DialogDescription>
// 						Add, edit, or remove reward types (e.g., Points, Cash, Gift Cards)
// 					</DialogDescription>
// 				</DialogHeader>

// 				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 					{/* Form */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>
// 								{editingType ? "Edit Reward Type" : "Add New Reward Type"}
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent>
// 							<form onSubmit={handleSubmit} className="space-y-4">
// 								<div className="space-y-2">
// 									<Label htmlFor="name">Reward Type Name *</Label>
// 									<Input
// 										id="name"
// 										value={formData.name}
// 										onChange={(e) =>
// 											setFormData((prev) => ({ ...prev, name: e.target.value }))
// 										}
// 										placeholder="e.g., Points, Cash, Gift Card"
// 										required
// 									/>
// 								</div>

// 								<div className="flex gap-2">
// 									<Button type="submit" disabled={loading}>
// 										{loading
// 											? "Saving..."
// 											: editingType
// 											? "Update Type"
// 											: "Add Type"}
// 									</Button>
// 									{editingType && (
// 										<Button type="button" variant="outline" onClick={resetForm}>
// 											Cancel Edit
// 										</Button>
// 									)}
// 								</div>
// 							</form>
// 						</CardContent>
// 					</Card>

// 					{/* Reward Types List */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Existing Types ({rewardTypes.length})</CardTitle>
// 						</CardHeader>
// 						<CardContent>
// 							{rewardTypes.length === 0 ? (
// 								<p className="text-muted-foreground text-center py-8">
// 									No reward types found
// 								</p>
// 							) : (
// 								<div className="space-y-2 max-h-64 overflow-y-auto">
// 									{rewardTypes.map((type) => (
// 										<div
// 											key={type.id}
// 											className="flex items-center justify-between border rounded-lg p-3">
// 											<span className="font-medium">{type.name}</span>
// 											<div className="flex gap-1">
// 												<Button
// 													size="sm"
// 													variant="outline"
// 													onClick={() => handleEdit(type)}>
// 													<Pencil className="h-3 w-3" />
// 												</Button>
// 												<Button
// 													size="sm"
// 													variant="outline"
// 													onClick={() => handleDelete(type.id)}>
// 													<Trash2 className="h-3 w-3" />
// 												</Button>
// 											</div>
// 										</div>
// 									))}
// 								</div>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div>

// 				<DialogFooter>
// 					<Button variant="outline" onClick={() => onOpenChange(false)}>
// 						Close
// 					</Button>
// 				</DialogFooter>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
