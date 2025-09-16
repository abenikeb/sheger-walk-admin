"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar, Target, FileText, X, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { API_URL, BEARER_TOKEN } from "@/lib/config.json";
import { Label } from "@/components/ui/label";

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
	// category: string;
	// value: number;
	// description?: string;
}

interface CreateChallengeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providers: ChallengeProvider[];
	rewardTypes: RewardType[];
	onSuccess: () => void;
}

const formSchema = z
	.object({
		name: z
			.string()
			.min(1, "Challenge name is required")
			.max(100, "Name must be less than 100 characters"),
		description: z
			.string()
			.min(10, "Description must be at least 10 characters")
			.max(500, "Description must be less than 500 characters"),
		challengeProviderId: z.string().optional(),
		rewardName: z.string().optional(),
		rewardValue: z.any().optional(),
		rewardTypeId: z.string().min(1, "Reward type is required"),
		joiningCost: z
			.number()
			.min(0, "Joining cost must be 0 or greater")
			.max(10000, "Joining cost must be less than $10,000"),
		isFree: z.boolean().default(false),
		stepsRequired: z
			.number()
			.min(1000, "Steps required must be at least 1,000")
			.max(1000000, "Steps required must be less than 1,000,000"),
		minParticipants: z
			.number()
			.min(1, "Minimum participants must be at least 1")
			.max(10000, "Maximum participants cannot exceed 10,000"),
		startDate: z.string().min(1, "Start date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endDate: z.string().min(1, "End date is required"),
		endTime: z.string().min(1, "End time is required"),
		expiryDate: z.string().min(1, "Expiry date is required"),
		expiryTime: z.string().min(1, "Expiry time is required"),
		image: z.any().optional(),
	})
	.refine(
		(data) => {
			const start = new Date(`${data.startDate}T${data.startTime}`);
			const now = new Date();
			return start >= now;
		},
		{
			message: "Start date and time must be in the future",
			path: ["startDate"],
		}
	)
	.refine(
		(data) => {
			const start = new Date(`${data.startDate}T${data.startTime}`);
			const end = new Date(`${data.endDate}T${data.endTime}`);
			return end > start;
		},
		{
			message: "End date and time must be after start date and time",
			path: ["endDate"],
		}
	)
	.refine(
		(data) => {
			const end = new Date(`${data.endDate}T${data.endTime}`);
			const expiry = new Date(`${data.expiryDate}T${data.expiryTime}`);
			return expiry >= end;
		},
		{
			message: "Expiry date and time must be on or after end date and time",
			path: ["expiryDate"],
		}
	);

type FormData = z.infer<typeof formSchema>;

export function CreateChallengeDialog({
	open,
	onOpenChange,
	providers,
	rewardTypes,
	onSuccess,
}: CreateChallengeDialogProps) {
	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			challengeProviderId: "0",
			rewardTypeId: "0",
			joiningCost: 0,
			isFree: false,
			stepsRequired: 10000,
			minParticipants: 10,
			startDate: "",
			startTime: "",
			rewardName: "",
			endDate: "",
			endTime: "",
			expiryDate: "",
			expiryTime: "",
			rewardValue: "",
		},
	});

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid file type",
					description: "Please select an image file",
					variant: "destructive",
				});
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: "File too large",
					description: "Please select an image smaller than 5MB",
					variant: "destructive",
				});
				return;
			}

			setImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(null);
	};

	const resetForm = () => {
		form.reset();
		setImageFile(null);
		setImagePreview(null);
	};

	const onSubmit = async (data: FormData) => {
		try {
			setLoading(true);

			const formData = new FormData();

			// Build datetime strings
			const startDateTime =
				data.startDate && data.startTime
					? new Date(`${data.startDate}T${data.startTime}`).toISOString()
					: null;

			const endDateTime =
				data.endDate && data.endTime
					? new Date(`${data.endDate}T${data.endTime}`).toISOString()
					: null;

			const expiryDateTime =
				data.expiryDate && data.expiryTime
					? new Date(`${data.expiryDate}T${data.expiryTime}`).toISOString()
					: null;

			// Payload
			const payload = {
				...data,
				challengeProviderId: data.challengeProviderId
					? Number.parseInt(data.challengeProviderId)
					: null,
				rewardTypeId: data.rewardTypeId
					? Number.parseInt(data.rewardTypeId)
					: null,
				joiningCost: data.isFree ? 0 : Number(data.joiningCost),
				stepsRequired: Number(data.stepsRequired),
				minParticipants: Number(data.minParticipants),
				rewardValue: Number(data.rewardValue),
				startDate: startDateTime,
				endDate: endDateTime,
				expiryDate: expiryDateTime,
			};

			// Append all fields except helper fields
			Object.entries(payload).forEach(([key, value]) => {
				if (
					key !== "startTime" &&
					key !== "endTime" &&
					key !== "expiryTime" &&
					key !== "isFree"
				) {
					if (value !== null && value !== undefined) {
						formData.append(key, value.toString());
					}
				}
			});

			// Attach image if available
			if (imageFile) {
				formData.append("image", imageFile);
			}

			// API request
			const response = await fetch(`${API_URL}/api/challenges`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${BEARER_TOKEN}`,
				},
				body: formData,
			});

			const result = await response.json();

			if (response.ok) {
				toast({
					title: "Success",
					description: "Challenge created successfully",
				});
				resetForm();
				onOpenChange(false);
				onSuccess();
			} else {
				toast({
					title: "Error",
					description: result.message || "Failed to create challenge",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error creating challenge:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// const onSubmit = async (data: FormData) => {
	// 	try {
	// 		setLoading(true);

	// 		const formData = new FormData();

	// 		const startDateTime = new Date(
	// 			`${data.startDate}T${data.startTime}`
	// 		).toISOString();
	// 		const endDateTime = new Date(
	// 			`${data.endDate}T${data.endTime}`
	// 		).toISOString();
	// 		const expiryDateTime = new Date(
	// 			`${data.expiryDate}T${data.expiryTime}`
	// 		).toISOString();

	// 		const payload = {
	// 			...data,
	// 			providerId: data.providerId ? Number.parseInt(data.providerId) : null,
	// 			rewardTypeId: Number.parseInt(data.rewardTypeId),
	// 			joiningCost: data.isFree ? 0 : data.joiningCost,
	// 			startDate: startDateTime,
	// 			endDate: endDateTime,
	// 			expiryDate: expiryDateTime,
	// 		};

	// 		Object.entries(payload).forEach(([key, value]) => {
	// 			if (
	// 				key !== "startTime" &&
	// 				key !== "endTime" &&
	// 				key !== "expiryTime" &&
	// 				key !== "isFree"
	// 			) {
	// 				formData.append(key, value?.toString() || "");
	// 			}
	// 		});

	// 		if (imageFile) {
	// 			formData.append("image", imageFile);
	// 		}

	// 		const response = await fetch(`${API_URL}/api/challenges`, {
	// 			method: "POST",
	// 			headers: {
	// 				Authorization: `Bearer ${BEARER_TOKEN}`,
	// 			},
	// 			body: formData,
	// 		});

	// 		const result = await response.json();

	// 		if (response.ok) {
	// 			toast({
	// 				title: "Success",
	// 				description: "Challenge created successfully",
	// 			});
	// 			resetForm();
	// 			onOpenChange(false);
	// 			onSuccess();
	// 		} else {
	// 			toast({
	// 				title: "Error",
	// 				description: result.message || "Failed to create challenge",
	// 				variant: "destructive",
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("Error creating challenge:", error);
	// 		toast({
	// 			title: "Error",
	// 			description: "An unexpected error occurred",
	// 			variant: "destructive",
	// 		});
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const formatDateForInput = (date: Date) => {
		return date.toISOString().split("T")[0];
	};

	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return formatDateForInput(tomorrow);
	};

	const getMinEndDate = () => {
		const startDate = form.watch("startDate");
		if (startDate) {
			const start = new Date(startDate);
			start.setDate(start.getDate() + 1);
			return formatDateForInput(start);
		}
		return getMinDate();
	};

	const getMinExpiryDate = () => {
		const endDate = form.watch("endDate");
		if (endDate) {
			return endDate;
		}
		return getMinDate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<Plus className="h-4 w-4 text-white" />
						</div>
						Create New Challenge
					</DialogTitle>
					<DialogDescription>
						Create a new challenge for users to participate in. Fill out all the
						required information below.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Basic Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Challenge Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter challenge name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe the challenge..."
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="space-y-2">
									<FormLabel>Challenge Image (Optional)</FormLabel>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
										{imagePreview ? (
											<div className="relative">
												<img
													src={imagePreview || "/placeholder.svg"}
													alt="Challenge preview"
													className="w-full h-48 object-cover rounded-lg"
												/>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													className="absolute top-2 right-2"
													onClick={removeImage}>
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<div className="text-center">
												<ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
												<div className="mt-4">
													<label
														htmlFor="image-upload"
														className="cursor-pointer">
														<span className="mt-2 block text-sm font-medium text-gray-900">
															Drop an image here, or{" "}
															<span className="text-blue-600 hover:text-blue-500">
																browse
															</span>
														</span>
														<input
															id="image-upload"
															type="file"
															className="sr-only"
															accept="image/*"
															onChange={handleImageUpload}
														/>
													</label>
													<p className="mt-1 text-xs text-gray-500">
														PNG, JPG, GIF up to 5MB
													</p>
												</div>
											</div>
										)}
									</div>
								</div>

								<FormField
									control={form.control}
									name="challengeProviderId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Provider (Optional)</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a provider" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="0">No Provider</SelectItem>
													{providers.map((provider) => (
														<SelectItem
															key={provider.id}
															value={provider.id.toString()}>
															{provider.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Challenge Details */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Target className="h-5 w-5" />
									Challenge Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="stepsRequired"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Steps Required</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="10000"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number.parseInt(e.target.value) || 0
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="minParticipants"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Minimum Participants</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="10"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number.parseInt(e.target.value) || 0
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-4">
										<FormField
											control={form.control}
											name="isFree"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Free Challenge
														</FormLabel>
														<div className="text-sm text-muted-foreground">
															Make this challenge free to join
														</div>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={(checked) => {
																field.onChange(checked);
																if (checked) {
																	form.setValue("joiningCost", 0);
																}
															}}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="joiningCost"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Joining Cost ($)</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															placeholder="0.00"
															disabled={form.watch("isFree")}
															{...field}
															onChange={(e) =>
																field.onChange(
																	Number.parseFloat(e.target.value) || 0
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="rewardName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reward Name</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="e.g., Completion Bonus"
														required
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="rewardValue"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reward Value *</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														min="0"
														placeholder="100"
														{...field}
														required
														onChange={(e) =>
															field.onChange(
																Number.parseFloat(e.target.value) || 0
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="rewardTypeId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reward Type</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select reward type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{rewardTypes.map((reward) => (
															<SelectItem
																key={reward.id}
																value={reward.id.toString()}>
																{reward.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Schedule */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Schedule
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="startDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Start Date</FormLabel>
													<FormControl>
														<Input type="date" min={getMinDate()} {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="startTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Start Time</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="endDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>End Date</FormLabel>
													<FormControl>
														<Input
															type="date"
															min={getMinEndDate()}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="endTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel>End Time</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="expiryDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Expiry Date</FormLabel>
													<FormControl>
														<Input
															type="date"
															min={getMinExpiryDate()}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="expiryTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Expiry Time</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

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
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// "use client";

// import type React from "react";

// import { useState } from "react";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";

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
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import {
// 	Popover,
// 	PopoverContent,
// 	PopoverTrigger,
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import {BEARER_TOKEN, API_URL} from "@/lib/config.json";

// interface ChallengeProvider {
// 	id: number;
// 	name: string;
// 	address: string;
// 	phone: string;
// 	description?: string;
// }

// interface RewardType {
// 	id: number;
// 	name: string;
// }

// interface CreateChallengeDialogProps {
// 	open: boolean;
// 	onOpenChange: (open: boolean) => void;
// 	providers: ChallengeProvider[];
// 	rewardTypes: RewardType[];
// 	onSuccess: () => void;
// }

// export function CreateChallengeDialog({
// 	open,
// 	onOpenChange,
// 	providers,
// 	rewardTypes,
// 	onSuccess,
// }: CreateChallengeDialogProps) {
// 	const [loading, setLoading] = useState(false);
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		description: "",
// 		challengeProviderId: "",
// 		joiningCost: "",
// 		startDate: undefined as Date | undefined,
// 		endDate: undefined as Date | undefined,
// 		expiryDate: undefined as Date | undefined,
// 		stepsRequired: "",
// 		minParticipants: "",
// 		image: "",
// 		// Reward fields
// 		rewardName: "",
// 		rewardTypeId: "",
// 		rewardValue: "",
// 	});

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);

// 		try {
// 			const response = await fetch(`${API_URL}/api/challenges/`, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					...formData,
// 					challengeProviderId: formData.challengeProviderId || null,
// 					joiningCost: Number(formData.joiningCost),
// 					stepsRequired: Number(formData.stepsRequired),
// 					minParticipants: Number(formData.minParticipants),
// 					rewardTypeId: Number(formData.rewardTypeId),
// 					rewardValue: Number(formData.rewardValue),
// 					startDate: formData.startDate?.toISOString(),
// 					endDate: formData.endDate?.toISOString(),
// 					expiryDate: formData.expiryDate?.toISOString(),
// 				}),
// 			});

// 			const data = await response.json();

// 			if (response.ok) {
// 				onSuccess();
// 				onOpenChange(false);
// 				// Reset form
// 				setFormData({
// 					name: "",
// 					description: "",
// 					challengeProviderId: "",
// 					joiningCost: "",
// 					startDate: undefined,
// 					endDate: undefined,
// 					expiryDate: undefined,
// 					stepsRequired: "",
// 					minParticipants: "",
// 					image: "",
// 					rewardName: "",
// 					rewardTypeId: "",
// 					rewardValue: "",
// 				});
// 			} else {
// 				alert(data.message || "Failed to create challenge");
// 			}
// 		} catch (error) {
// 			console.error("Error creating challenge:", error);
// 			alert("Failed to create challenge");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
// 				<DialogHeader>
// 					<DialogTitle>Create New Challenge</DialogTitle>
// 					<DialogDescription>
// 						Create a new challenge with rewards for participants
// 					</DialogDescription>
// 				</DialogHeader>

// 				<form onSubmit={handleSubmit} className="space-y-6">
// 					{/* Basic Information */}
// 					<div className="space-y-4">
// 						<h3 className="text-lg font-medium">Basic Information</h3>

// 						<div className="grid grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="name">Challenge Name *</Label>
// 								<Input
// 									id="name"
// 									value={formData.name}
// 									onChange={(e) =>
// 										setFormData((prev) => ({ ...prev, name: e.target.value }))
// 									}
// 									placeholder="e.g., 10K Steps Challenge"
// 									required
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="provider">Challenge Provider</Label>
// 								<Select
// 									value={formData.challengeProviderId}
// 									onValueChange={(value) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											challengeProviderId: value,
// 										}))
// 									}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select provider (optional)" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{providers.map((provider) => (
// 											<SelectItem
// 												key={provider.id}
// 												value={provider.id.toString()}>
// 												{provider.name}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</div>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="description">Description *</Label>
// 							<Textarea
// 								id="description"
// 								value={formData.description}
// 								onChange={(e) =>
// 									setFormData((prev) => ({
// 										...prev,
// 										description: e.target.value,
// 									}))
// 								}
// 								placeholder="Describe the challenge objectives and rules..."
// 								required
// 							/>
// 						</div>

// 						<div className="grid grid-cols-3 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="joiningCost">Joining Cost ($) *</Label>
// 								<Input
// 									id="joiningCost"
// 									type="number"
// 									min="0"
// 									step="0.01"
// 									value={formData.joiningCost}
// 									onChange={(e) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											joiningCost: e.target.value,
// 										}))
// 									}
// 									placeholder="0"
// 									required
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="stepsRequired">Steps Required *</Label>
// 								<Input
// 									id="stepsRequired"
// 									type="number"
// 									min="1"
// 									value={formData.stepsRequired}
// 									onChange={(e) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											stepsRequired: e.target.value,
// 										}))
// 									}
// 									placeholder="10000"
// 									required
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="minParticipants">Min Participants *</Label>
// 								<Input
// 									id="minParticipants"
// 									type="number"
// 									min="1"
// 									value={formData.minParticipants}
// 									onChange={(e) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											minParticipants: e.target.value,
// 										}))
// 									}
// 									placeholder="10"
// 									required
// 								/>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Dates */}
// 					<div className="space-y-4">
// 						<h3 className="text-lg font-medium">Schedule</h3>

// 						<div className="grid grid-cols-3 gap-4">
// 							<div className="space-y-2">
// 								<Label>Start Date *</Label>
// 								<Popover>
// 									<PopoverTrigger asChild>
// 										<Button
// 											variant="outline"
// 											className={cn(
// 												"w-full justify-start text-left font-normal",
// 												!formData.startDate && "text-muted-foreground"
// 											)}>
// 											<CalendarIcon className="mr-2 h-4 w-4" />
// 											{formData.startDate
// 												? format(formData.startDate, "PPP")
// 												: "Pick a date"}
// 										</Button>
// 									</PopoverTrigger>
// 									<PopoverContent className="w-auto p-0">
// 										<Calendar
// 											mode="single"
// 											selected={formData.startDate}
// 											onSelect={(date) =>
// 												setFormData((prev) => ({ ...prev, startDate: date }))
// 											}
// 											initialFocus
// 										/>
// 									</PopoverContent>
// 								</Popover>
// 							</div>

// 							<div className="space-y-2">
// 								<Label>End Date *</Label>
// 								<Popover>
// 									<PopoverTrigger asChild>
// 										<Button
// 											variant="outline"
// 											className={cn(
// 												"w-full justify-start text-left font-normal",
// 												!formData.endDate && "text-muted-foreground"
// 											)}>
// 											<CalendarIcon className="mr-2 h-4 w-4" />
// 											{formData.endDate
// 												? format(formData.endDate, "PPP")
// 												: "Pick a date"}
// 										</Button>
// 									</PopoverTrigger>
// 									<PopoverContent className="w-auto p-0">
// 										<Calendar
// 											mode="single"
// 											selected={formData.endDate}
// 											onSelect={(date) =>
// 												setFormData((prev) => ({ ...prev, endDate: date }))
// 											}
// 											initialFocus
// 										/>
// 									</PopoverContent>
// 								</Popover>
// 							</div>

// 							<div className="space-y-2">
// 								<Label>Expiry Date *</Label>
// 								<Popover>
// 									<PopoverTrigger asChild>
// 										<Button
// 											variant="outline"
// 											className={cn(
// 												"w-full justify-start text-left font-normal",
// 												!formData.expiryDate && "text-muted-foreground"
// 											)}>
// 											<CalendarIcon className="mr-2 h-4 w-4" />
// 											{formData.expiryDate
// 												? format(formData.expiryDate, "PPP")
// 												: "Pick a date"}
// 										</Button>
// 									</PopoverTrigger>
// 									<PopoverContent className="w-auto p-0">
// 										<Calendar
// 											mode="single"
// 											selected={formData.expiryDate}
// 											onSelect={(date) =>
// 												setFormData((prev) => ({ ...prev, expiryDate: date }))
// 											}
// 											initialFocus
// 										/>
// 									</PopoverContent>
// 								</Popover>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Reward Information */}
// 					<div className="space-y-4">
// 						<h3 className="text-lg font-medium">Reward Details</h3>

// 						<div className="grid grid-cols-3 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="rewardName">Reward Name *</Label>
// 								<Input
// 									id="rewardName"
// 									value={formData.rewardName}
// 									onChange={(e) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											rewardName: e.target.value,
// 										}))
// 									}
// 									placeholder="e.g., Completion Bonus"
// 									required
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="rewardType">Reward Type *</Label>
// 								<Select
// 									value={formData.rewardTypeId}
// 									onValueChange={(value) =>
// 										setFormData((prev) => ({ ...prev, rewardTypeId: value }))
// 									}
// 									required>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select reward type" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{rewardTypes.map((type) => (
// 											<SelectItem key={type.id} value={type.id.toString()}>
// 												{type.name}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="rewardValue">Reward Value *</Label>
// 								<Input
// 									id="rewardValue"
// 									type="number"
// 									min="0"
// 									step="0.01"
// 									value={formData.rewardValue}
// 									onChange={(e) =>
// 										setFormData((prev) => ({
// 											...prev,
// 											rewardValue: e.target.value,
// 										}))
// 									}
// 									placeholder="100"
// 									required
// 								/>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Image Upload */}
// 					<div className="space-y-4">
// 						<h3 className="text-lg font-medium">Challenge Image</h3>
// 						<div className="space-y-2">
// 							<Label htmlFor="image">Image URL</Label>
// 							<Input
// 								id="image"
// 								value={formData.image}
// 								onChange={(e) =>
// 									setFormData((prev) => ({ ...prev, image: e.target.value }))
// 								}
// 								placeholder="https://example.com/challenge-image.jpg"
// 							/>
// 						</div>
// 					</div>

// 					<DialogFooter>
// 						<Button
// 							type="button"
// 							variant="outline"
// 							onClick={() => onOpenChange(false)}>
// 							Cancel
// 						</Button>
// 						<Button type="submit" disabled={loading}>
// 							{loading ? "Creating..." : "Create Challenge"}
// 						</Button>
// 					</DialogFooter>
// 				</form>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
