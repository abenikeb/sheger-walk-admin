"use client";

import type React from "react";

import { useState, useEffect } from "react";
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

interface ChallengeProvider {
	id: number;
	name: string;
	address: string;
	phone: string;
	description?: string;
	logoUrl?: string; // Added logoUrl field
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
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

	useEffect(() => {
		if (provider) {
			setFormData({
				name: provider.name,
				address: provider.address,
				phone: provider.phone,
				description: provider.description || "",
			});
			setCurrentLogoUrl(provider.logoUrl || null);
			setLogoPreview(null);
			setLogoFile(null);
		}
	}, [provider]);

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
		setCurrentLogoUrl(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!provider) return;

		setLoading(true);

		try {
			const submitData = new FormData();
			submitData.append("name", formData.name);
			submitData.append("address", formData.address);
			submitData.append("phone", formData.phone);
			submitData.append("description", formData.description);

			if (logoFile) {
				submitData.append("logo", logoFile);
			} else if (!currentLogoUrl) {
				// If no current logo and no new file, explicitly remove logo
				submitData.append("removeLogo", "true");
			}

			const response = await fetch(
				`${API_URL}/api/challenges/challengeProvider/${provider.id}`,
				{
					method: "PUT",
					body: submitData, // Using FormData instead of JSON
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

	const displayLogo = logoPreview || currentLogoUrl;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
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
						<Label htmlFor="logo">Provider Logo</Label>
						<div className="flex items-center gap-4">
							{displayLogo ? (
								<div className="relative">
									<img
										src={displayLogo || "/placeholder.svg"}
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
							{loading ? "Updating..." : "Update Provider"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";

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
// import { BEARER_TOKEN, API_URL } from "@/lib/config.json";

// interface ChallengeProvider {
// 	id: number;
// 	name: string;
// 	address: string;
// 	phone: string;
// 	description?: string;
// }

// interface EditProviderDialogProps {
// 	open: boolean;
// 	onOpenChange: (open: boolean) => void;
// 	provider: ChallengeProvider | null;
// 	onSuccess: () => void;
// }

// export function EditProviderDialog({
// 	open,
// 	onOpenChange,
// 	provider,
// 	onSuccess,
// }: EditProviderDialogProps) {
// 	const [loading, setLoading] = useState(false);
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		address: "",
// 		phone: "",
// 		description: "",
// 	});

// 	useEffect(() => {
// 		if (provider) {
// 			setFormData({
// 				name: provider.name,
// 				address: provider.address,
// 				phone: provider.phone,
// 				description: provider.description || "",
// 			});
// 		}
// 	}, [provider]);

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		if (!provider) return;

// 		setLoading(true);

// 		try {
// 			const response = await fetch(
// 				`${API_URL}/api/challenges/challengeProvider/${provider.id}`,
// 				{
// 					method: "PUT",
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
// 			} else {
// 				alert(data.message || "Failed to update provider");
// 			}
// 		} catch (error) {
// 			console.error("Error updating provider:", error);
// 			alert("Failed to update provider");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent>
// 				<DialogHeader>
// 					<DialogTitle>Edit Provider</DialogTitle>
// 					<DialogDescription>
// 						Update provider information and details
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
// 							{loading ? "Updating..." : "Update Provider"}
// 						</Button>
// 					</DialogFooter>
// 				</form>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
