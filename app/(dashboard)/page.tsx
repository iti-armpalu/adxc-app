import Link from "next/link";
import {
    ArrowRight,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Users,
    Activity,
    CreditCard,
    Clock,
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

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET /v2/orgs/{org_id}/balance          → OrgBalanceResponse
// GET /v2/orgs/{org_id}                  → OrgResponse
// GET /v2/orgs/{org_id}/usage/monthly    → MonthlyUsageResponse
// GET /v2/orgs/{org_id}/users/active     → ActiveUsersResponse
// GET /v2/orgs/{org_id}/activity/recent  → RecentActivityResponse

const MOCK = {
    org_name: "DEPT",
    balance: "372.50",
    currency: "USD",
    spend_this_month: "127.50",
    spend_last_month: "203.80",
    queries_this_month: 23,
    avg_per_query: "5.54",
    spend_cap: "500.00",
    active_users: 7,
    total_users: 12,
    // Recent top-ups / charges for the activity feed
    // TODO: wire up GET /v2/orgs/{org_id}/ledger
    recent_activity: [
        {
            id: "act_1",
            type: "topup",
            description: "Credit top-up",
            amount: "+$200.00",
            ts: "Today, 09:14",
        },
        {
            id: "act_2",
            type: "query",
            description: "Query approved — YouGov + Reddit",
            amount: "-$8.20",
            ts: "Today, 08:51",
        },
        {
            id: "act_3",
            type: "query",
            description: "Query approved — US Census",
            amount: "-$3.10",
            ts: "Yesterday, 16:33",
        },
        {
            id: "act_4",
            type: "query",
            description: "Query approved — X + QUID",
            amount: "-$11.40",
            ts: "Yesterday, 11:02",
        },
        {
            id: "act_5",
            type: "topup",
            description: "Credit top-up",
            amount: "+$500.00",
            ts: "12 May, 10:00",
        },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: string) {
    return `$${parseFloat(value).toFixed(2)}`;
}

function spendPercent(spent: string, cap: string) {
    return Math.min(Math.round((parseFloat(spent) / parseFloat(cap)) * 100), 100);
}

function spendDelta(current: string, previous: string) {
    const curr = parseFloat(current);
    const prev = parseFloat(previous);
    if (prev === 0) return null;
    const pct = Math.round(((curr - prev) / prev) * 100);
    return pct;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    delta?: number | null; // positive = increase, negative = decrease
}

function StatCard({ label, value, sub, delta }: StatCardProps) {
    const isUp = delta !== null && delta !== undefined && delta > 0;
    const isDown = delta !== null && delta !== undefined && delta < 0;

    return (
        <Card>
            <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                    {label}
                </p>
                <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                    {value}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    {sub && (
                        <p className="text-xs text-muted-foreground">{sub}</p>
                    )}
                    {delta !== null && delta !== undefined && (
                        <span
                            className={`inline-flex items-center gap-0.5 text-xs font-medium ${isDown
                                    ? "text-emerald-700" // less spend = good
                                    : isUp
                                        ? "text-orange-600"
                                        : "text-muted-foreground"
                                }`}
                        >
                            {isDown ? (
                                <TrendingDown size={11} />
                            ) : isUp ? (
                                <TrendingUp size={11} />
                            ) : null}
                            {Math.abs(delta)}% vs last month
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface ActivityRowProps {
    type: string;
    description: string;
    amount: string;
    ts: string;
    isLast: boolean;
}

function ActivityRow({ type, description, amount, ts, isLast }: ActivityRowProps) {
    const isTopup = type === "topup";
    return (
        <div
            className={`flex items-center justify-between py-3 ${!isLast ? "border-b border-border" : ""
                }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${isTopup
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-brand-50 text-brand-600"
                        }`}
                >
                    {isTopup ? (
                        <CreditCard size={13} />
                    ) : (
                        <Activity size={13} />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {ts}
                    </p>
                </div>
            </div>
            <span
                className={`text-sm font-semibold shrink-0 ml-4 tabular-nums ${isTopup ? "text-emerald-700" : "text-foreground"
                    }`}
            >
                {amount}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const percent = spendPercent(MOCK.spend_this_month, MOCK.spend_cap);
    const isWarning = percent >= 70 && percent < 100;
    const isBlocked = percent >= 100;
    const isLowBalance = parseFloat(MOCK.balance) < 50;
    const delta = spendDelta(MOCK.spend_this_month, MOCK.spend_last_month);

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Page title ── */}
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-0.5">
                    {MOCK.org_name}
                </p>
                <h2>Account overview</h2>
            </div>

            {/* ── Balance card ── */}
            <Card
                className={
                    isLowBalance
                        ? "border-destructive bg-destructive text-white"
                        : "bg-brand-600 border-brand-600 text-white"
                }
            >
                <CardContent className="pt-6 pb-6">
                    {isLowBalance && (
                        <div className="flex items-center gap-1.5 mb-3 opacity-90">
                            <AlertTriangle size={13} />
                            <p className="text-xs font-semibold uppercase tracking-wide">
                                Low balance — top up to continue queries
                            </p>
                        </div>
                    )}
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
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        This month's usage
                    </p>
                    <Badge variant="secondary" className="text-xs font-medium">
                        May 2026
                    </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        label="Total spent"
                        value={formatCurrency(MOCK.spend_this_month)}
                        delta={delta}
                    />
                    <StatCard
                        label="Queries run"
                        value={MOCK.queries_this_month.toString()}
                        sub="this month"
                    />
                    <StatCard
                        label="Avg. per query"
                        value={formatCurrency(MOCK.avg_per_query)}
                    />
                    <StatCard
                        label="Active users"
                        value={`${MOCK.active_users} of ${MOCK.total_users}`}
                        sub="used platform this month"
                    // TODO: wire up GET /v2/orgs/{org_id}/users/active
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
                        {formatCurrency(MOCK.spend_this_month)} of{" "}
                        {formatCurrency(MOCK.spend_cap)} used
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="w-full h-2 bg-muted rounded-xs overflow-hidden">
                        <div
                            className={`h-full rounded-xs transition-all duration-500 ${isBlocked
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
                        {isWarning && !isBlocked && (
                            <span className="text-xs font-semibold text-orange-600">
                                Approaching limit
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Users at a glance ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            Users
                        </CardTitle>
                        <Link
                            href="/users"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Manage users
                        </Link>
                    </div>
                    <CardDescription>
                        {MOCK.active_users} of {MOCK.total_users} members active this month
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {/* Seat utilisation bar */}
                    <div className="w-full h-2 bg-muted rounded-xs overflow-hidden">
                        <div
                            className="h-full rounded-xs bg-primary transition-all duration-500"
                            style={{
                                width: `${Math.round(
                                    (MOCK.active_users / MOCK.total_users) * 100
                                )}%`,
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                            {Math.round(
                                (MOCK.active_users / MOCK.total_users) * 100
                            )}
                            % seat utilisation
                        </span>
                        <Link
                            href="/users/invite"
                            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                            <Users size={11} />
                            Invite member
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* ── Recent activity ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Recent activity
                    </p>
                    <Link
                        href="/billing"
                        className="text-xs text-primary hover:underline font-medium"
                    >
                        View full ledger
                    </Link>
                </div>

                {/* TODO: wire up GET /v2/orgs/{org_id}/ledger?limit=5 */}
                <Card>
                    <CardContent className="pt-1 pb-1 px-5">
                        {MOCK.recent_activity.map((item, i) => (
                            <ActivityRow
                                key={item.id}
                                type={item.type}
                                description={item.description}
                                amount={item.amount}
                                ts={item.ts}
                                isLast={i === MOCK.recent_activity.length - 1}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}