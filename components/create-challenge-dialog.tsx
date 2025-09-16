"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
	CalendarIcon,
	Upload,
	X,
	DollarSign,
	Gift,
	Target,
	Clock,
	ImageIcon,
} from "lucide-react";

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
	FormDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { API_URL, BEARER_TOKEN } from "@/lib/config.json";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
		joiningCost: z.number().min(0, "Joining cost cannot be negative"),
		isFree: z.boolean().default(false),
		startDate: z.date({
			required_error: "Start date is required",
		}),
		startTime: z.string().min(1, "Start time is required"),
		endDate: z.date({
			required_error: "End date is required",
		}),
		endTime: z.string().min(1, "End time is required"),
		expiryDate: z.date({
			required_error: "Expiry date is required",
		}),
		expiryTime: z.string().min(1, "Expiry time is required"),
		stepsRequired: z.number().min(1, "Steps required must be at least 1"),
		minParticipants: z
			.number()
			.min(1, "Minimum participants must be at least 1"),
		rewardName: z.string().min(1, "Reward name is required"),
		rewardValue: z.number().min(0.01, "Reward value must be greater than 0"),
		rewardTypeId: z.string().min(1, "Reward type is required"),
		image: z.instanceof(File).optional(),
	})
	.refine(
		(data) => {
			return data.endDate >= data.startDate;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		}
	)
	.refine(
		(data) => {
			return data.expiryDate >= data.endDate;
		},
		{
			message: "Expiry date must be after end date",
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

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			challengeProviderId: "",
			joiningCost: 0,
			isFree: true,
			startTime: "09:00",
			endTime: "18:00",
			expiryTime: "23:59",
			stepsRequired: 10000,
			minParticipants: 10,
			rewardName: "",
			rewardValue: 0,
			rewardTypeId: "",
		},
	});

	const isFree = form.watch("isFree");

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid file type",
					description: "Please select an image file",
					variant: "destructive",
				});
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: "File too large",
					description: "Please select an image smaller than 5MB",
					variant: "destructive",
				});
				return;
			}

			form.setValue("image", file);

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		form.setValue("image", undefined);
		setImagePreview(null);
	};

	const onSubmit = async (data: FormData) => {
		try {
			setLoading(true);

			// Combine date and time
			const startDateTime = new Date(data.startDate);
			const [startHour, startMinute] = data.startTime.split(":");
			startDateTime.setHours(
				Number.parseInt(startHour),
				Number.parseInt(startMinute)
			);

			const endDateTime = new Date(data.endDate);
			const [endHour, endMinute] = data.endTime.split(":");
			endDateTime.setHours(
				Number.parseInt(endHour),
				Number.parseInt(endMinute)
			);

			const expiryDateTime = new Date(data.expiryDate);
			const [expiryHour, expiryMinute] = data.expiryTime.split(":");
			expiryDateTime.setHours(
				Number.parseInt(expiryHour),
				Number.parseInt(expiryMinute)
			);

			// Create FormData for file upload
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("description", data.description);
			formData.append("challengeProviderId", data.challengeProviderId || "");
			formData.append(
				"joiningCost",
				(data.isFree ? 0 : data.joiningCost).toString()
			);
			formData.append("startDate", startDateTime.toISOString());
			formData.append("endDate", endDateTime.toISOString());
			formData.append("expiryDate", expiryDateTime.toISOString());
			formData.append("stepsRequired", data.stepsRequired.toString());
			formData.append("minParticipants", data.minParticipants.toString());
			formData.append("rewardName", data.rewardName);
			formData.append("rewardValue", data.rewardValue.toString());
			formData.append("rewardTypeId", data.rewardTypeId);

			if (data.image) {
				formData.append("image", data.image);
			}

			const response = await fetch(`${API_URL}/api/challenges/create`, {
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
				form.reset();
				setImagePreview(null);
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<Target className="h-4 w-4 text-white" />
						</div>
						Create New Challenge
					</DialogTitle>
					<DialogDescription>
						Create a new challenge with detailed settings, rewards, and
						participation requirements.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Basic Information */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Gift className="h-5 w-5" />
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
													<Input
														placeholder="Enter challenge name"
														{...field}
													/>
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

									<FormField
										control={form.control}
										name="challengeProviderId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Provider (Optional)</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value || "0"}>
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

							{/* Challenge Image */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<ImageIcon className="h-5 w-5" />
										Challenge Image
									</CardTitle>
								</CardHeader>
								<CardContent>
									<FormField
										control={form.control}
										name="image"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Upload Image</FormLabel>
												<FormControl>
													<div className="space-y-4">
														{imagePreview ? (
															<div className="relative">
																<img
																	src={imagePreview || "/placeholder.svg"}
																	alt="Challenge preview"
																	className="w-full h-48 object-cover rounded-lg border"
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
															<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
																<Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
																<div className="space-y-2">
																	<p className="text-sm text-gray-600">
																		Click to upload or drag and drop
																	</p>
																	<p className="text-xs text-gray-500">
																		PNG, JPG, GIF up to 5MB
																	</p>
																</div>
																<Input
																	type="file"
																	accept="image/*"
																	onChange={handleImageChange}
																	className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
																/>
															</div>
														)}
													</div>
												</FormControl>
												<FormDescription>
													Upload an image to represent your challenge (optional)
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>
						</div>

						{/* Cost and Requirements */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Cost & Requirements
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="isFree"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
												<div className="space-y-0.5">
													<FormLabel className="text-base">
														Free Challenge
													</FormLabel>
													<FormDescription>
														No joining cost required
													</FormDescription>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									{!isFree && (
										<FormField
											control={form.control}
											name="joiningCost"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Joining Cost ($)</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															step="0.01"
															placeholder="0.00"
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
									)}

									<FormField
										control={form.control}
										name="stepsRequired"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Steps Required</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="1"
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
														min="1"
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
							</CardContent>
						</Card>

						{/* Schedule */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Schedule
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Start Date & Time */}
									<div className="space-y-4">
										<h4 className="font-medium text-green-600">Start</h4>
										<FormField
											control={form.control}
											name="startDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Start Date</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground"
																	)}>
																	{field.value ? (
																		format(field.value, "PPP")
																	) : (
																		<span>Pick a date</span>
																	)}
																	<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																disabled={(date) =>
																	date <
																	new Date(new Date().setHours(0, 0, 0, 0))
																}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
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

									{/* End Date & Time */}
									<div className="space-y-4">
										<h4 className="font-medium text-red-600">End</h4>
										<FormField
											control={form.control}
											name="endDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>End Date</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground"
																	)}>
																	{field.value ? (
																		format(field.value, "PPP")
																	) : (
																		<span>Pick a date</span>
																	)}
																	<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																disabled={(date) =>
																	date <
																	new Date(new Date().setHours(0, 0, 0, 0))
																}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
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

									{/* Expiry Date & Time */}
									<div className="space-y-4">
										<h4 className="font-medium text-orange-600">Expiry</h4>
										<FormField
											control={form.control}
											name="expiryDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Expiry Date</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground"
																	)}>
																	{field.value ? (
																		format(field.value, "PPP")
																	) : (
																		<span>Pick a date</span>
																	)}
																	<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																disabled={(date) =>
																	date <
																	new Date(new Date().setHours(0, 0, 0, 0))
																}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
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

						{/* Rewards */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Gift className="h-5 w-5" />
									Reward Configuration
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="rewardName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reward Name</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Cash Prize, Gift Card"
														{...field}
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
												<FormLabel>Reward Value</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="0.01"
														step="0.01"
														placeholder="0.00"
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

									<FormField
										control={form.control}
										name="rewardTypeId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reward Type</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value || "0"}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select reward type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{rewardTypes.map((type) => (
															<SelectItem
																key={type.id}
																value={type.id.toString()}>
																{type.name}
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

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={loading}>
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
