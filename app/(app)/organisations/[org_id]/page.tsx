"use client";

import { use } from "react";
import Link from "next/link";
import {
    Zap,
    ArrowRight,
    CheckCircle,
    Clock,
    CreditCard,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnswerSummary = {
    uuid: string;
    question: string;
    price: string;
    paid: boolean;
    created_at: string;
    paid_at: string | null;
};

// ---------------------------------------------------------------------------
// Mock data
// TODO: GET /v2/orgs/{org_id}/balance → OrgBalanceResponse
// TODO: GET /v2/orgs/{org_id}/members/me/answers → AnswerListResponse
// ---------------------------------------------------------------------------

const MOCK_BALANCE = {
    balance: "1240.00",
    currency: "usd",
};

const MOCK_RECENT_ANSWERS: AnswerSummary[] = [
    {
        uuid: "ans_9a1b2c3d",
        question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?",
        price: "12.50",
        paid: false,
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        paid_at: null,
    },
    {
        uuid: "ans_2m3n4o5p",
        question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.",
        price: "15.00",
        paid: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 14 + 420000).toISOString(),
    },
    {
        uuid: "ans_8i9j0k1l",
        question: "What percentage of US households earning over $100k use meal-kit delivery services?",
        price: "6.50",
        paid: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 300000).toISOString(),
    },
];

const MOCK_STATS = {
    totalQueries: 24,
    pendingApproval: 1,
    approvedThisMonth: 8,
    spentThisMonth: "94.50",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
}

function balanceColor(balance: string) {
    const n = parseFloat(balance);
    if (n <= 0) return "text-destructive-text";
    if (n < 50) return "text-warning";
    return "text-foreground";
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
    label,
    value,
    icon: Icon,
    sub,
    href,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    sub?: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col gap-4 bg-card border p-5 hover:border-border-3 transition-colors"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <Icon size={15} />
                </div>
            </div>
            <div className="flex items-end justify-between gap-2">
                <span className="text-3xl font-semibold tracking-tight">{value}</span>
                {sub && <span className="text-xs text-muted-foreground mb-1">{sub}</span>}
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
    title,
    href,
    linkLabel = "View all",
}: {
    title: string;
    href: string;
    linkLabel?: string;
}) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
                <Link href={href}>
                    {linkLabel}
                    <ArrowRight size={12} />
                </Link>
            </Button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgOverviewPage({
    params: paramsPromise,
}: {
    params: Promise<{ org_id: string }>;
}) {
    const { org_id } = use(paramsPromise);
    const base = `/organisations/${org_id}`;

    // TODO: GET /v2/orgs/{org_id}/members/me → to get org name + role
    // For now using mock
    const orgName = "Unilever Global Insights";

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{orgName}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Your organisation overview.
                    </p>
                </div>
                <Button asChild className="gap-2 shrink-0 hidden sm:flex">
                    <Link href={`${base}/query`}>
                        <Zap size={15} strokeWidth={2} />
                        New query
                    </Link>
                </Button>
            </div>

            {/* ── Stat cards ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Balance — not clickable, no billing page */}
                <div className="flex flex-col gap-4 bg-card border p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground">
                            <CreditCard size={15} />
                        </div>
                    </div>
                    <span className={`text-2xl font-semibold tracking-tight tabular-nums ${balanceColor(MOCK_BALANCE.balance)}`}>
                        {formatCurrency(MOCK_BALANCE.balance)}
                    </span>
                </div>

                <StatCard
                    label="Total queries"
                    value={MOCK_STATS.totalQueries}
                    icon={TrendingUp}
                    href={`${base}/queries`}
                />
                <StatCard
                    label="Approved this month"
                    value={MOCK_STATS.approvedThisMonth}
                    icon={CheckCircle}
                    href={`${base}/queries`}
                />
                {/* Spent this month — not clickable, no billing page */}
                <div className="flex flex-col gap-4 bg-card border p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Spent this month</span>
                        <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground">
                            <CreditCard size={15} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <span className="text-2xl font-semibold tracking-tight tabular-nums">
                            {formatCurrency(MOCK_STATS.spentThisMonth)}
                        </span>
                        <span className="text-xs text-muted-foreground mb-1">USD</span>
                    </div>
                </div>
            </div>

            {/* ── Recent answers ───────────────────────────────────────────────── */}
            <div>
                <SectionHeader title="Recent queries" href={`${base}/queries`} />
                <div className="flex flex-col gap-2">
                    {MOCK_RECENT_ANSWERS.map((answer) => (
                        <Link
                            key={answer.uuid}
                            href={`${base}/queries/${answer.uuid}`}
                            className="group bg-card border p-4 flex flex-col gap-2 hover:border-border-3 transition-colors sm:flex-row sm:items-start sm:gap-4"
                        >
                            {/* Status icon */}
                            <div className="hidden sm:block mt-0.5 shrink-0">
                                {answer.paid ? (
                                    <CheckCircle size={15} className="text-success" />
                                ) : (
                                    <Clock size={15} className="text-warning" />
                                )}
                            </div>

                            {/* Question */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors sm:line-clamp-2">
                                    {answer.question}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {timeAgo(answer.created_at)}
                                </p>
                            </div>

                            {/* Price + status */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 shrink-0">
                                <span className="text-sm font-medium tabular-nums">
                                    {formatCurrency(answer.price)}
                                </span>
                                {answer.paid ? (
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal text-success border-success/40 bg-success/5"
                                    >
                                        Approved
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal text-warning border-warning/40 bg-warning/5"
                                    >
                                        Pending
                                    </Badge>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Quick actions ────────────────────────────────────────────────── */}
            <div>
                <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href={`${base}/query`}
                        className="group flex items-center gap-3 bg-card border p-4 hover:border-border-3 transition-colors"
                    >
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Zap size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Run a query</p>
                            <p className="text-xs text-muted-foreground">Ask a question across data providers</p>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>

                    <Link
                        href={`${base}/queries`}
                        className="group flex items-center gap-3 bg-card border p-4 hover:border-border-3 transition-colors"
                    >
                        <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground shrink-0">
                            <CheckCircle size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">View queries</p>
                            <p className="text-xs text-muted-foreground">Review your queries and answers</p>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                </div>
            </div>

        </div>
    );
}