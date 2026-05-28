import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
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
// GET /v2/orgs/{org_id}/balance  → OrgBalanceResponse { balance, currency }
// GET /v2/orgs/{org_id}          → org object { daily_member_spend_cap }

const MOCK = {
    balance: "372.50",
    currency: "USD",
    spend_this_month: "127.50",
    queries_this_month: 23,
    internal_data_cost: "0.00",
    avg_per_query: "5.54",
};

function formatCurrency(value: string) {
    return `$${parseFloat(value).toFixed(2)}`;
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

export default function BillingPage() {
    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Page title ── */}
            <div>
                <h2 className="text-h4 font-bold text-foreground tracking-[-0.02em]">
                    Pay-on-Demand Billing
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    You only pay when you purchase data reports. No monthly fees or subscriptions.
                </p>
            </div>

            {/* ── Account balance ── */}
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
                        {/* Add funds — disabled in v1, managed manually by ADXC */}
                        <Button
                            variant="secondary"
                            className="shrink-0 bg-white text-brand-600 hover:bg-brand-50 font-semibold opacity-60 cursor-not-allowed"
                            disabled
                            title="Contact your account manager to add funds"
                        >
                            <Plus size={15} className="mr-1.5" />
                            Add funds
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── How it works ── */}
            <Card className="bg-brand-50 border-brand-100">
                <CardContent className="pt-5 pb-5">
                    <p className="text-xs font-semibold text-brand-700 uppercase tracking-[0.08em] mb-3">
                        How pay-on-demand works
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            { title: "No subscription fees", desc: "Only pay for the data you need" },
                            { title: "Per-query pricing", desc: "Each data source has its own cost" },
                            { title: "Internal data is always free", desc: "Your knowledge base and 1PD data" },
                            { title: "Approve before purchase", desc: "See costs before committing" },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-2">
                                <span className="text-brand-600 font-bold text-sm mt-0.5">·</span>
                                <p className="text-sm text-foreground">
                                    <span className="font-semibold text-brand-700">{item.title}</span>
                                    {" — "}
                                    <span className="text-muted-foreground">{item.desc}</span>
                                </p>
                            </div>
                        ))}
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
                        label="Reports purchased"
                        value={MOCK.queries_this_month.toString()}
                    />
                    <StatCard
                        label="Internal data"
                        value={formatCurrency(MOCK.internal_data_cost)}
                        sub="always free"
                        highlight
                    />
                    <StatCard
                        label="Avg. per report"
                        value={formatCurrency(MOCK.avg_per_query)}
                    />
                </div>
            </div>

            <Separator />

            {/* ── Payment methods ── */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                    Payment methods
                </h3>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Managed by ADXC
                        </CardTitle>
                        <CardDescription>
                            Your account balance is managed by your ADXC account manager.
                            To add funds or update payment details, contact your account manager directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            asChild
                        >
                            <a href="mailto:accounts@adxc.ai">
                                Contact account manager
                                <ArrowUpRight size={13} />
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ── Manage spending ── */}
            <Card className="border-dashed">
                <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Want to set a spend limit?
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Protect your balance by setting a monthly cap on spending.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0">
                        <Link href="/spending">
                            Manage limits
                        </Link>
                    </Button>
                </CardContent>
            </Card>

        </div>
    );
}