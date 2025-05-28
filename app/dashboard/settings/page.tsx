"use client";

import { useEffect, useState } from "react";
import {
	Coins,
	Users,
	DollarSign,
	Gift,
	Save,
	RefreshCw,
	AlertCircle,
	CheckCircle,
	TrendingUp,
	Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { API_URL } from "@/lib/config.json";

interface CoinSettings {
	id?: number;
	dailyClaimablePoints: number;
	stepToCoinRate: number;
	coinToEtbRate: number;
	minimumWithdrawal: number;
	maximumWithdrawal: number;
	withdrawalFeePercentage: number;
	isWithdrawalEnabled: boolean;
	updatedAt?: string;
}

interface ReferralSettings {
	id?: number;
	isEnabled: boolean;
	referrerBonus: number;
	refereeBonus: number;
	minimumReferrals: number;
	bonusType: "coins" | "points" | "etb";
	maxReferralBonus: number;
	referralExpireDays: number;
	description: string;
	updatedAt?: string;
}

interface SystemStats {
	totalUsers: number;
	totalCoinsInCirculation: number;
	totalWithdrawals: number;
	totalReferrals: number;
	averageDailyActivity: number;
}

export default function SettingsPage() {
	const [coinSettings, setCoinSettings] = useState<CoinSettings>({
		dailyClaimablePoints: 100,
		stepToCoinRate: 0.001,
		coinToEtbRate: 0.5,
		minimumWithdrawal: 100,
		maximumWithdrawal: 10000,
		withdrawalFeePercentage: 2.5,
		isWithdrawalEnabled: true,
	});

	const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
		isEnabled: true,
		referrerBonus: 50,
		refereeBonus: 25,
		minimumReferrals: 1,
		bonusType: "coins",
		maxReferralBonus: 1000,
		referralExpireDays: 30,
		description:
			"Refer friends and earn bonus coins for each successful referral!",
	});

	const [systemStats, setSystemStats] = useState<SystemStats>({
		totalUsers: 0,
		totalCoinsInCirculation: 0,
		totalWithdrawals: 0,
		totalReferrals: 0,
		averageDailyActivity: 0,
	});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState("coins");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		fetchSettings();
		fetchSystemStats();
	}, []);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const [coinResponse, referralResponse] = await Promise.all([
				fetch(`${API_URL}/api/settings/coins`),
				fetch(`${API_URL}/api/settings/referrals`),
			]);

			if (coinResponse.ok) {
				const coinData = await coinResponse.json();
				if (coinData.settings) {
					setCoinSettings(coinData.settings);
				}
			}

			if (referralResponse.ok) {
				const referralData = await referralResponse.json();
				if (referralData.settings) {
					setReferralSettings(referralData.settings);
				}
			}
		} catch (error) {
			console.error("Error fetching settings:", error);
			setErrorMessage("Failed to load settings");
		} finally {
			setLoading(false);
		}
	};

	const fetchSystemStats = async () => {
		try {
			const response = await fetch(`${API_URL}/api/settings/stats`);
			if (response.ok) {
				const data = await response.json();
				setSystemStats(data.stats);
			}
		} catch (error) {
			console.error("Error fetching system stats:", error);
		}
	};

	const saveCoinSettings = async () => {
		try {
			setSaving(true);
			setErrorMessage("");

			const response = await fetch(`${API_URL}/api/settings/coins`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(coinSettings),
			});

			const data = await response.json();

			if (response.ok) {
				setCoinSettings(data.settings);
				setSuccessMessage("Coin settings saved successfully!");
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setErrorMessage(data.message || "Failed to save coin settings");
			}
		} catch (error) {
			console.error("Error saving coin settings:", error);
			setErrorMessage("Failed to save coin settings");
		} finally {
			setSaving(false);
		}
	};

	const saveReferralSettings = async () => {
		try {
			setSaving(true);
			setErrorMessage("");

			const response = await fetch(
				`${API_URL}/api/settings/referrals`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify(referralSettings),
				}
			);

			const data = await response.json();

			if (response.ok) {
				setReferralSettings(data.settings);
				setSuccessMessage("Referral settings saved successfully!");
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setErrorMessage(data.message || "Failed to save referral settings");
			}
		} catch (error) {
			console.error("Error saving referral settings:", error);
			setErrorMessage("Failed to save referral settings");
		} finally {
			setSaving(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString()} ETB`;
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Never";
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading settings...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
					<p className="text-muted-foreground">
						Manage coin rates, referral programs, and system configurations
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={fetchSettings}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Success/Error Messages */}
			{successMessage && (
				<Alert className="border-green-200 bg-green-50">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800">
						{successMessage}
					</AlertDescription>
				</Alert>
			)}

			{errorMessage && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			{/* System Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{systemStats.totalUsers.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Coins in Circulation
						</CardTitle>
						<Coins className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{systemStats.totalCoinsInCirculation.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Withdrawals
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(systemStats.totalWithdrawals)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Referrals
						</CardTitle>
						<Gift className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{systemStats.totalReferrals.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Daily Activity
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{systemStats.averageDailyActivity.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">avg steps/day</p>
					</CardContent>
				</Card>
			</div>

			{/* Settings Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="coins">Coin Management</TabsTrigger>
					<TabsTrigger value="referrals">Referral Settings</TabsTrigger>
				</TabsList>

				{/* Coin Management Tab */}
				<TabsContent value="coins" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Basic Coin Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Coins className="w-5 h-5" />
									Coin Configuration
								</CardTitle>
								<CardDescription>
									Configure basic coin earning and conversion rates
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="dailyClaimablePoints">
										Daily Claimable Points
									</Label>
									<Input
										id="dailyClaimablePoints"
										type="number"
										min="0"
										value={coinSettings.dailyClaimablePoints}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												dailyClaimablePoints: Number(e.target.value),
											}))
										}
									/>
									<p className="text-sm text-muted-foreground">
										Points users can claim daily for free
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="stepToCoinRate">
										Steps to Sheger Coin Rate
									</Label>
									<Input
										id="stepToCoinRate"
										type="number"
										min="0"
										step="0.0001"
										value={coinSettings.stepToCoinRate}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												stepToCoinRate: Number(e.target.value),
											}))
										}
									/>
									<p className="text-sm text-muted-foreground">
										Coins earned per step (e.g., 0.001 = 1000 steps = 1 coin)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="coinToEtbRate">Coin to ETB Rate</Label>
									<Input
										id="coinToEtbRate"
										type="number"
										min="0"
										step="0.01"
										value={coinSettings.coinToEtbRate}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												coinToEtbRate: Number(e.target.value),
											}))
										}
									/>
									<p className="text-sm text-muted-foreground">
										Ethiopian Birr value per coin
									</p>
								</div>

								<Separator />

								<div className="p-4 rounded-lg">
									<h4 className="font-medium mb-2">Rate Preview</h4>
									<div className="space-y-1 text-sm">
										<p>
											1,000 steps ={" "}
											{(1000 * coinSettings.stepToCoinRate).toFixed(2)} coins
										</p>
										<p>1 coin = {coinSettings.coinToEtbRate} ETB</p>
										<p>
											10,000 steps ={" "}
											{formatCurrency(
												10000 *
													coinSettings.stepToCoinRate *
													coinSettings.coinToEtbRate
											)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Withdrawal Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="w-5 h-5" />
									Withdrawal Settings
								</CardTitle>
								<CardDescription>
									Configure withdrawal limits and fees
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Enable Withdrawals</Label>
										<p className="text-sm text-muted-foreground">
											Allow users to withdraw coins to ETB
										</p>
									</div>
									<Switch
										checked={coinSettings.isWithdrawalEnabled}
										onCheckedChange={(checked) =>
											setCoinSettings((prev) => ({
												...prev,
												isWithdrawalEnabled: checked,
											}))
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="minimumWithdrawal">
										Minimum Withdrawal (Coins)
									</Label>
									<Input
										id="minimumWithdrawal"
										type="number"
										min="0"
										value={coinSettings.minimumWithdrawal}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												minimumWithdrawal: Number(e.target.value),
											}))
										}
										disabled={!coinSettings.isWithdrawalEnabled}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="maximumWithdrawal">
										Maximum Withdrawal (Coins)
									</Label>
									<Input
										id="maximumWithdrawal"
										type="number"
										min="0"
										value={coinSettings.maximumWithdrawal}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												maximumWithdrawal: Number(e.target.value),
											}))
										}
										disabled={!coinSettings.isWithdrawalEnabled}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="withdrawalFeePercentage">
										Withdrawal Fee (%)
									</Label>
									<Input
										id="withdrawalFeePercentage"
										type="number"
										min="0"
										max="100"
										step="0.1"
										value={coinSettings.withdrawalFeePercentage}
										onChange={(e) =>
											setCoinSettings((prev) => ({
												...prev,
												withdrawalFeePercentage: Number(e.target.value),
											}))
										}
										disabled={!coinSettings.isWithdrawalEnabled}
									/>
								</div>

								{coinSettings.isWithdrawalEnabled && (
									<div className="p-4  rounded-lg">
										<h4 className="font-medium mb-2">Withdrawal Example</h4>
										<div className="space-y-1 text-sm">
											<p>Withdrawal: 1,000 coins</p>
											<p>
												Fee ({coinSettings.withdrawalFeePercentage}%):{" "}
												{(1000 * coinSettings.withdrawalFeePercentage) / 100}{" "}
												coins
											</p>
											<p>
												Net Amount:{" "}
												{formatCurrency(
													(1000 -
														(1000 * coinSettings.withdrawalFeePercentage) /
															100) *
														coinSettings.coinToEtbRate
												)}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="flex justify-end">
						<Button onClick={saveCoinSettings} disabled={saving}>
							{saving ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Saving...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Save Coin Settings
								</>
							)}
						</Button>
					</div>

					{coinSettings.updatedAt && (
						<p className="text-sm text-muted-foreground text-center">
							Last updated: {formatDate(coinSettings.updatedAt)}
						</p>
					)}
				</TabsContent>

				{/* Referral Settings Tab */}
				<TabsContent value="referrals" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Basic Referral Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Gift className="w-5 h-5" />
									Referral Program
								</CardTitle>
								<CardDescription>
									Configure referral bonuses and requirements
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Enable Referral Program</Label>
										<p className="text-sm text-muted-foreground">
											Allow users to refer friends and earn bonuses
										</p>
									</div>
									<Switch
										checked={referralSettings.isEnabled}
										onCheckedChange={(checked) =>
											setReferralSettings((prev) => ({
												...prev,
												isEnabled: checked,
											}))
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="referrerBonus">Referrer Bonus</Label>
									<Input
										id="referrerBonus"
										type="number"
										min="0"
										value={referralSettings.referrerBonus}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												referrerBonus: Number(e.target.value),
											}))
										}
										disabled={!referralSettings.isEnabled}
									/>
									<p className="text-sm text-muted-foreground">
										Bonus for the person who refers
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="refereeBonus">Referee Bonus</Label>
									<Input
										id="refereeBonus"
										type="number"
										min="0"
										value={referralSettings.refereeBonus}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												refereeBonus: Number(e.target.value),
											}))
										}
										disabled={!referralSettings.isEnabled}
									/>
									<p className="text-sm text-muted-foreground">
										Bonus for the person who gets referred
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bonusType">Bonus Type</Label>
									<select
										id="bonusType"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
										value={referralSettings.bonusType}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												bonusType: e.target.value as "coins" | "points" | "etb",
											}))
										}
										disabled={!referralSettings.isEnabled}>
										<option value="coins">Coins</option>
										<option value="points">Points</option>
										<option value="etb">ETB</option>
									</select>
								</div>
							</CardContent>
						</Card>

						{/* Advanced Referral Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Award className="w-5 h-5" />
									Advanced Settings
								</CardTitle>
								<CardDescription>
									Configure limits and expiration rules
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="minimumReferrals">Minimum Referrals</Label>
									<Input
										id="minimumReferrals"
										type="number"
										min="1"
										value={referralSettings.minimumReferrals}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												minimumReferrals: Number(e.target.value),
											}))
										}
										disabled={!referralSettings.isEnabled}
									/>
									<p className="text-sm text-muted-foreground">
										Minimum referrals needed to earn bonus
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="maxReferralBonus">
										Maximum Referral Bonus
									</Label>
									<Input
										id="maxReferralBonus"
										type="number"
										min="0"
										value={referralSettings.maxReferralBonus}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												maxReferralBonus: Number(e.target.value),
											}))
										}
										disabled={!referralSettings.isEnabled}
									/>
									<p className="text-sm text-muted-foreground">
										Maximum total bonus per user
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="referralExpireDays">
										Referral Expiry (Days)
									</Label>
									<Input
										id="referralExpireDays"
										type="number"
										min="1"
										value={referralSettings.referralExpireDays}
										onChange={(e) =>
											setReferralSettings((prev) => ({
												...prev,
												referralExpireDays: Number(e.target.value),
											}))
										}
										disabled={!referralSettings.isEnabled}
									/>
									<p className="text-sm text-muted-foreground">
										Days after which referral link expires
									</p>
								</div>

								{referralSettings.isEnabled && (
									<div className="p-4 bg-purple-50 rounded-lg">
										<h4 className="font-medium mb-2">Referral Preview</h4>
										<div className="space-y-1 text-sm">
											<p>
												Referrer gets: {referralSettings.referrerBonus}{" "}
												{referralSettings.bonusType}
											</p>
											<p>
												Referee gets: {referralSettings.refereeBonus}{" "}
												{referralSettings.bonusType}
											</p>
											<p>
												Max bonus: {referralSettings.maxReferralBonus}{" "}
												{referralSettings.bonusType}
											</p>
											<p>
												Link expires in: {referralSettings.referralExpireDays}{" "}
												days
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Referral Description */}
					<Card>
						<CardHeader>
							<CardTitle>Referral Program Description</CardTitle>
							<CardDescription>
								Message shown to users about the referral program
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={referralSettings.description}
								onChange={(e) =>
									setReferralSettings((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Describe the referral program benefits..."
								rows={3}
								disabled={!referralSettings.isEnabled}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button onClick={saveReferralSettings} disabled={saving}>
							{saving ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Saving...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Save Referral Settings
								</>
							)}
						</Button>
					</div>

					{referralSettings.updatedAt && (
						<p className="text-sm text-muted-foreground text-center">
							Last updated: {formatDate(referralSettings.updatedAt)}
						</p>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
