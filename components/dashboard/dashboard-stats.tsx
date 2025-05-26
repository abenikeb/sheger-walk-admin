"use client";

import {
	Users,
	CreditCard,
	Footprints,
	Trophy,
	UserCheck,
	Activity,
	Clock,
	TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { MetricCard } from "@/components/ui/metric-card";

interface SystemStats {
	users: {
		total: number;
		newLastWeek: number;
	};
	challenges: {
		total: number;
		active: number;
	};
	transactions: {
		count: number;
		totalAmount: number;
	};
	activities: {
		count: number;
		totalSteps: number;
		recentCount: number;
	};
	withdrawals: {
		pendingCount: number;
		pendingAmount: number;
	};
}

interface ProfileCompletionStats {
	completed: number;
	incomplete: number;
	percentage: number;
}

interface DashboardStatsProps {
	stats: SystemStats | null;
	profileCompletionStats: ProfileCompletionStats;
	loading?: boolean;
}

export function DashboardStats({
	stats,
	profileCompletionStats,
	loading = false,
}: DashboardStatsProps) {
	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Primary Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Users"
					value={stats?.users.total || 0}
					subtitle={
						stats?.users.newLastWeek
							? `+${stats.users.newLastWeek} this period`
							: undefined
					}
					icon={Users}
					variant="primary"
					trend={
						stats?.users.newLastWeek
							? {
									value: stats.users.newLastWeek,
									label: "this period",
									isPositive: true,
							  }
							: undefined
					}
				/>

				<StatCard
					title="Total Points"
					value={stats?.transactions.totalAmount || 0}
					subtitle={
						stats
							? `${formatNumber(stats.transactions.count)} transactions`
							: undefined
					}
					icon={CreditCard}
					variant="secondary"
				/>

				<StatCard
					title="Total Steps"
					value={stats?.activities.totalSteps || 0}
					subtitle={
						stats
							? `${formatNumber(stats.activities.count)} activities`
							: undefined
					}
					icon={Footprints}
					variant="success"
				/>

				<StatCard
					title="Active Challenges"
					value={stats?.challenges.active || 0}
					subtitle={
						stats
							? `of ${formatNumber(stats.challenges.total)} total`
							: undefined
					}
					icon={Trophy}
					variant="warning"
				/>
			</div>

			{/* Secondary Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Profile Completion"
					value={`${profileCompletionStats.percentage}%`}
					subtitle={`${formatNumber(
						profileCompletionStats.completed
					)} of ${formatNumber(
						profileCompletionStats.completed + profileCompletionStats.incomplete
					)} users`}
					icon={UserCheck}
					color="green"
				/>

				<MetricCard
					title="Recent Activity"
					value={stats?.activities.recentCount || 0}
					subtitle="Activities this period"
					icon={Activity}
					color="purple"
				/>

				<MetricCard
					title="Pending Withdrawals"
					value={stats?.withdrawals.pendingCount || 0}
					subtitle={
						stats
							? `${formatNumber(
									stats.withdrawals.pendingAmount
							  )} points pending`
							: undefined
					}
					icon={Clock}
					color="amber"
				/>

				<MetricCard
					title="Avg. Steps/Activity"
					value={
						stats && stats.activities.count > 0
							? formatNumber(
									Math.round(
										stats.activities.totalSteps / stats.activities.count
									)
							  )
							: 0
					}
					subtitle="Steps per activity"
					icon={TrendingUp}
					color="indigo"
				/>
			</div>
		</div>
	);
}
