"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { API_URL, BEARER_TOKEN } from "@/lib/config.json";


const formSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	phone: z.string().optional(),
	age: z
		.union([z.number().positive().int().optional(), z.literal("")])
		.transform((val) => (val === "" ? undefined : val)),
	height: z
		.union([z.number().positive().optional(), z.literal("")])
		.transform((val) => (val === "" ? undefined : val)),
	weight: z
		.union([z.number().positive().optional(), z.literal("")])
		.transform((val) => (val === "" ? undefined : val)),
	gender: z.string().optional(),
	roles: z.array(z.string()).default(["User"]),
	isProfileCompleted: z.boolean().default(false),
});

export default function EditUserPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const userId = params.id;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			age: "",
			height: "",
			weight: "",
			gender: "",
			roles: ["User"],
			isProfileCompleted: false,
		} as any,
	});

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${BEARER_TOKEN}`
					},
				});
				const data = await response.json();

				console.log("Fetched user data:", data);

				if (data.user) {
					// Set form values from user data
					form.reset({
						name: data.user.name,
						email: data.user.email,
						phone: data.user.phone || "",
						age: data.user.age || "",
						height: data.user.height || "",
						weight: data.user.weight || "",
						gender: data.user.gender || "",
						roles: data.user.roles,
						isProfileCompleted: data.user.isProfileCompleted,
					});
				}
			} catch (error) {
				console.error("Error fetching user details:", error);
				toast({
					title: "Error loading user",
					description: "Could not load user details. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (userId) {
			fetchUserData();
		}
	}, [userId, form, toast]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true);

			// Make API call to update user
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update user");
			}

			toast({
				title: "User updated successfully",
				description: `${values.name}'s information has been updated.`,
			});

			// Redirect to user details
			router.push(`/dashboard/users/${userId}`);
			router.refresh();
		} catch (error) {
			console.error("Error updating user:", error);
			toast({
				title: "Error updating user",
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="mr-2">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
						<p className="text-sm text-muted-foreground">
							Loading user details...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="mr-2">
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
			</div>

			<Card className="dashboard-card app-border">
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>
						Update user details and profile information
					</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter full name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter email address"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone Number</FormLabel>
											<FormControl>
												<Input placeholder="Enter phone number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* <FormField
									control={form.control}
									name="gender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Gender</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value || ""}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select gender" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="">Not specified</SelectItem>
													<SelectItem value="MALE">Male</SelectItem>
													<SelectItem value="FEMALE">Female</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/> */}
							</div>

							<div className="grid gap-6 md:grid-cols-3">
								<FormField
									control={form.control}
									name="age"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Age</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Enter age"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value === ""
																? ""
																: parseInt(e.target.value)
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
									name="height"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Height (cm)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Enter height"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value === ""
																? ""
																: parseFloat(e.target.value)
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
									name="weight"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Weight (kg)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Enter weight"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value === ""
																? ""
																: parseFloat(e.target.value)
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
								name="roles"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Roles</FormLabel>
										<div className="flex flex-wrap gap-2">
											{["User", "Premium", "Admin"].map((role) => (
												<Button
													key={role}
													type="button"
													variant={
														field.value.includes(role) ? "default" : "outline"
													}
													className={
														field.value.includes(role)
															? "bg-app-primary hover:bg-app-primary/90"
															: ""
													}
													onClick={() => {
														const updatedRoles = field.value.includes(role)
															? field.value.filter((r) => r !== role)
															: [...field.value, role];

														// Ensure at least one role is selected
														if (updatedRoles.length > 0) {
															field.onChange(updatedRoles);
														}
													}}>
													{role}
												</Button>
											))}
										</div>
										<FormDescription>
											Select one or more roles for this user
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isProfileCompleted"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
										<FormControl>
											<input
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-app-primary focus:ring-app-primary"
												checked={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Profile Completed</FormLabel>
											<FormDescription>
												Mark the user's profile as complete
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => router.back()}
								disabled={isSubmitting}>
								Cancel
							</Button>
							<Button
								type="submit"
								className="bg-app-primary hover:bg-app-primary/90"
								disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
