"use client";

import { Clock, CheckCircle, XCircle } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";

interface WithdrawalStats {
	pending: number;
	approved: number;
	rejected: number;
}

interface SystemStats {
	withdrawals: {
		pendingAmount: number;
	};
}

interface WithdrawalOverviewProps {
	withdrawalStats: WithdrawalStats;
	stats: SystemStats | null;
}

export function WithdrawalOverview({
	withdrawalStats,
	stats,
}: WithdrawalOverviewProps) {
	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	return (
		<Card className="dashboard-card shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-border/50 hover:border-border/80 bg-gradient-to-br from-background via-background/95 to-muted/20 dark:from-background dark:via-background/98 dark:to-muted/10">
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-bold">Withdrawal Overview</CardTitle>
				<CardDescription className="text-muted-foreground/80">
					Current withdrawal request status and metrics
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 md:grid-cols-3">
					<MetricCard
						title="Pending Requests"
						value={withdrawalStats.pending}
						subtitle={
							stats
								? `${formatNumber(stats.withdrawals.pendingAmount)} points`
								: "No pending amount"
						}
						icon={Clock}
						color="amber"
					/>

					<MetricCard
						title="Approved Requests"
						value={withdrawalStats.approved}
						subtitle="Total approved"
						icon={CheckCircle}
						color="green"
					/>

					<MetricCard
						title="Rejected Requests"
						value={withdrawalStats.rejected}
						subtitle="Total rejected"
						icon={XCircle}
						color="red"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
