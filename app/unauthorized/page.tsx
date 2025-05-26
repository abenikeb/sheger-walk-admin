import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full">
				<Card>
					<CardHeader className="text-center">
						<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<CardTitle className="text-2xl font-bold text-gray-900">
							Access Denied
						</CardTitle>
						<CardDescription>
							You don't have permission to access this page.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-gray-600 mb-6">
							Please contact your administrator if you believe this is an error.
						</p>
						<Button asChild>
							<Link href="/dashboard">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Dashboard
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
