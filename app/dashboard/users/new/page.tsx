"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	phone: z.string().optional(),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters.",
	}),
	role: z.string().default("User"),
});

export default function NewUserPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			password: "",
			role: "User",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true);

			// Make API call to create user
			const response = await fetch("http://localhost:3001/api/admin/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization":
						"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJhZG1pbjEyQGdtYWlsLmNvbSIsImlzUG9ydGFsVXNlciI6dHJ1ZSwiaWF0IjoxNzQ3NDY5MDkwLCJleHAiOjE3NTAwNjEwOTB9.ZNMZ1ymCn76MyGYalLbrxhpcbVYC-suGS34K9TCik2M",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create user");
			}

			toast({
				title: "User created successfully",
				description: `${values.name} has been added to the system.`,
			});

			// Redirect to users list
			router.push("/dashboard/users");
			router.refresh();
		} catch (error) {
			console.error("Error creating user:", error);
			toast({
				title: "Error creating user",
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
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
				<h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
			</div>

			<Card className="dashboard-card app-border">
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>Enter the details for the new user</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
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

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter phone number (optional)"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Phone number is optional but recommended
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter password"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Password must be at least 8 characters
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="User">User</SelectItem>
												<SelectItem value="Premium">Premium</SelectItem>
												<SelectItem value="Admin">Admin</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											Select the user's role in the system
										</FormDescription>
										<FormMessage />
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
								{isSubmitting ? "Creating..." : "Create User"}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
