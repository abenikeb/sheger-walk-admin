"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X } from "lucide-react";

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
import { API_URL } from "@/lib/config.json";

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
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setLogoPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = new FormData();
			submitData.append("name", formData.name);
			submitData.append("address", formData.address);
			submitData.append("phone", formData.phone);
			submitData.append("description", formData.description);

			if (logoFile) {
				submitData.append("logo", logoFile);
			}

			const response = await fetch(
				`${API_URL}/api/challenges/challengeProvider`,
				{
					method: "POST",
					body: submitData, // Using FormData instead of JSON
				}
			);

			const data = await response.json();

			if (response.ok) {
				onSuccess();
				onOpenChange(false);
				setFormData({ name: "", address: "", phone: "", description: "" });
				setLogoFile(null);
				setLogoPreview(null);
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
			<DialogContent className="max-w-md">
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
						<Label htmlFor="logo">Provider Logo</Label>
						<div className="flex items-center gap-4">
							{logoPreview ? (
								<div className="relative">
									<img
										src={logoPreview || "/placeholder.svg"}
										alt="Logo preview"
										className="w-16 h-16 object-cover rounded-lg border"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
										onClick={removeLogo}>
										<X className="h-3 w-3" />
									</Button>
								</div>
							) : (
								<div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
									<Upload className="h-6 w-6 text-muted-foreground" />
								</div>
							)}
							<div className="flex-1">
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoChange}
									className="cursor-pointer"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									PNG, JPG up to 2MB
								</p>
							</div>
						</div>
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
// "use client";

// import type React from "react";

// import { useState } from "react";

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
// import { Textarea } from "@/components/ui/textarea";
// import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

// interface CreateProviderDialogProps {
// 	open: boolean;
// 	onOpenChange: (open: boolean) => void;
// 	onSuccess: () => void;
// }

// export function CreateProviderDialog({
// 	open,
// 	onOpenChange,
// 	onSuccess,
// }: CreateProviderDialogProps) {
// 	const [loading, setLoading] = useState(false);
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		address: "",
// 		phone: "",
// 		description: "",
// 	});

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);

// 		try {
// 			const response = await fetch(
// 				`${API_URL}/api/challenges/challengeProvider`,
// 				{
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify(formData),
// 				}
// 			);

// 			const data = await response.json();

// 			if (response.ok) {
// 				onSuccess();
// 				onOpenChange(false);
// 				setFormData({ name: "", address: "", phone: "", description: "" });
// 			} else {
// 				alert(data.message || "Failed to create provider");
// 			}
// 		} catch (error) {
// 			console.error("Error creating provider:", error);
// 			alert("Failed to create provider");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent>
// 				<DialogHeader>
// 					<DialogTitle>Create New Provider</DialogTitle>
// 					<DialogDescription>
// 						Add a new challenge provider organization
// 					</DialogDescription>
// 				</DialogHeader>

// 				<form onSubmit={handleSubmit} className="space-y-4">
// 					<div className="space-y-2">
// 						<Label htmlFor="name">Provider Name *</Label>
// 						<Input
// 							id="name"
// 							value={formData.name}
// 							onChange={(e) =>
// 								setFormData((prev) => ({ ...prev, name: e.target.value }))
// 							}
// 							placeholder="e.g., FitCorp"
// 							required
// 						/>
// 					</div>

// 					<div className="space-y-2">
// 						<Label htmlFor="address">Address *</Label>
// 						<Input
// 							id="address"
// 							value={formData.address}
// 							onChange={(e) =>
// 								setFormData((prev) => ({ ...prev, address: e.target.value }))
// 							}
// 							placeholder="e.g., 123 Main St, City, State"
// 							required
// 						/>
// 					</div>

// 					<div className="space-y-2">
// 						<Label htmlFor="phone">Phone *</Label>
// 						<Input
// 							id="phone"
// 							value={formData.phone}
// 							onChange={(e) =>
// 								setFormData((prev) => ({ ...prev, phone: e.target.value }))
// 							}
// 							placeholder="e.g., +251-911-123456"
// 							required
// 						/>
// 					</div>

// 					<div className="space-y-2">
// 						<Label htmlFor="description">Description</Label>
// 						<Textarea
// 							id="description"
// 							value={formData.description}
// 							onChange={(e) =>
// 								setFormData((prev) => ({
// 									...prev,
// 									description: e.target.value,
// 								}))
// 							}
// 							placeholder="Optional description of the provider..."
// 							rows={3}
// 						/>
// 					</div>

// 					<DialogFooter>
// 						<Button
// 							type="button"
// 							variant="outline"
// 							onClick={() => onOpenChange(false)}>
// 							Cancel
// 						</Button>
// 						<Button type="submit" disabled={loading}>
// 							{loading ? "Creating..." : "Create Provider"}
// 						</Button>
// 					</DialogFooter>
// 				</form>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
