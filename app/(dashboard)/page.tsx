import Link from "next/link";
import {
    ArrowRight,
    BarChart2,
    Zap,
    DollarSign,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET /v2/orgs/{org_id}/balance  → OrgBalanceResponse
// GET /v2/orgs/{org_id}          → org object

const MOCK = {
    balance: "372.50",
    currency: "USD",
    spend_this_month: "127.50",
    queries_this_month: 23,
    internal_data_cost: "0.00",
    avg_per_query: "5.54",
    spend_cap: "500.00",
};

function formatCurrency(value: string) {
    return `$${parseFloat(value).toFixed(2)}`;
}

function spendPercent(spent: string, cap: string) {
    return Math.min(Math.round((parseFloat(spent) / parseFloat(cap)) * 100), 100);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
}

function StatCard({ label, value, sub, highlight }: StatCardProps) {
    return (
        <Card className={highlight ? "border-emerald-200 bg-emerald-50" : ""}>
            <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                    {label}
                </p>
                <p className={`text-h4 font-bold tracking-[-0.02em] ${highlight ? "text-emerald-700" : "text-foreground"}`}>
                    {value}
                </p>
                {sub && (
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const percent = spendPercent(MOCK.spend_this_month, MOCK.spend_cap);
    const isWarning = percent >= 70 && percent < 100;
    const isBlocked = percent >= 100;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Welcome ── */}
            <div>
                <h2>
                    Good morning
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Here's your account overview for DEPT.
                </p>
            </div>

            {/* ── Balance card ── */}
            <Card className="bg-brand-600 border-brand-600 text-white">
                <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-brand-200 font-medium">
                                Account balance
                            </p>
                            <p className="text-[40px] font-bold tracking-[-0.03em] leading-none text-white">
                                {formatCurrency(MOCK.balance)}
                            </p>
                            <p className="text-sm text-brand-200 mt-1">
                                Available credit for data purchases
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="shrink-0 bg-white text-brand-600 hover:bg-brand-50 font-semibold"
                            asChild
                        >
                            <Link href="/billing">
                                View billing
                                <ArrowRight size={15} className="ml-1.5" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── This month's usage ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        This month's usage
                    </h3>
                    <Badge variant="secondary" className="text-xs font-medium">
                        May 2026
                    </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        label="Total spent"
                        value={formatCurrency(MOCK.spend_this_month)}
                    />
                    <StatCard
                        label="Queries run"
                        value={MOCK.queries_this_month.toString()}
                        sub="reports purchased"
                    />
                    <StatCard
                        label="Internal data"
                        value={formatCurrency(MOCK.internal_data_cost)}
                        sub="always free"
                        highlight
                    />
                    <StatCard
                        label="Avg. per query"
                        value={formatCurrency(MOCK.avg_per_query)}
                    />
                </div>
            </div>

            {/* ── Spend limit progress ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            Monthly spend limit
                        </CardTitle>
                        <Link
                            href="/spending"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Manage limits
                        </Link>
                    </div>
                    <CardDescription>
                        {formatCurrency(MOCK.spend_this_month)} of {formatCurrency(MOCK.spend_cap)} used
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isBlocked
                                    ? "bg-destructive"
                                    : isWarning
                                        ? "bg-orange-500"
                                        : "bg-primary"
                                }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                            {percent}% used
                        </span>
                        {isBlocked && (
                            <span className="text-xs font-semibold text-destructive">
                                Limit reached — queries blocked
                            </span>
                        )}
                        {isWarning && (
                            <span className="text-xs font-semibold text-orange-600">
                                Approaching limit
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* ── Quick actions ── */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                    Quick actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                        <Link href="/billing">
                            <CardContent className="pt-5 pb-5 flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center shrink-0">
                                    <DollarSign size={15} className="text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        View billing
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Balance, usage and payment history
                                    </p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                        <Link href="/spending">
                            <CardContent className="pt-5 pb-5 flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center shrink-0">
                                    <BarChart2 size={15} className="text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        Spending & limits
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Set your monthly spend cap
                                    </p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                        <Link href="/organization">
                            <CardContent className="pt-5 pb-5 flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center shrink-0">
                                    <Zap size={15} className="text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        Organization
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Manage your org details
                                    </p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                </div>
            </div>

        </div>
    );
}