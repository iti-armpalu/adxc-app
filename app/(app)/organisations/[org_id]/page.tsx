"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle,
    Clock,
    CreditCard,
    TrendingUp,
    Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnswerListItemResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTokens(value: string) {
    const n = parseFloat(value);
    if (isNaN(n)) return "—";
    return `${new Intl.NumberFormat("en-US").format(n)} tokens`;
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
    if (n < 100) return "text-warning";
    return "text-foreground";
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
    label, value, icon: Icon, sub, href,
}: {
    label: string; value: string | number;
    icon: React.ElementType; sub?: string; href: string;
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
    title, href, linkLabel = "View all",
}: {
    title: string; href: string; linkLabel?: string;
}) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
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

    const [orgName, setOrgName] = useState("…");
    const [balance, setBalance] = useState<string | null>(null);
    const [answers, setAnswers] = useState<AnswerListItemResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // GET /v2/orgs → find org name by org_id
    useEffect(() => {
        fetch("/api/orgs")
            .then((r) => r.json())
            .then((data) => {
                const match = (data.orgs ?? []).find((o: { org_id: string; org_name: string }) => o.org_id === org_id);
                if (match) setOrgName(match.org_name);
            })
            .catch(() => { });
    }, [org_id]);

    // GET /v2/orgs/{org_id}/balance → balance
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/balance`)
            .then((r) => r.json())
            .then((data) => { if (data.balance != null) setBalance(data.balance); })
            .catch(() => { });
    }, [org_id]);

    // GET /v2/orgs/{org_id}/members/me/answers → recent answers
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/members/me/answers`)
            .then((r) => r.json())
            .then((data) => {
                const sorted = (data.answers ?? []).sort(
                    (a: AnswerListItemResponse, b: AnswerListItemResponse) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setAnswers(sorted);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [org_id]);

    const pendingCount = answers.filter((a) => !a.paid).length;
    const approvedCount = answers.filter((a) => a.paid).length;
    const recentAnswers = answers.slice(0, 3);

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{orgName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Your organisation overview.
                </p>
            </div>

            {/* ── Stat cards ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Balance */}
                <div className="flex flex-col gap-4 bg-card border p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground">
                            <CreditCard size={15} />
                        </div>
                    </div>
                    <span className={cn("text-2xl font-semibold tracking-tight tabular-nums", balance != null ? balanceColor(balance) : "text-muted-foreground")}>
                        {balance != null ? formatTokens(balance) : "…"}
                    </span>
                </div>

                <StatCard
                    label="Total queries"
                    value={loading ? "…" : answers.length}
                    icon={TrendingUp}
                    href={`${base}/queries`}
                />
                <StatCard
                    label="Approved"
                    value={loading ? "…" : approvedCount}
                    icon={CheckCircle}
                    href={`${base}/queries`}
                />
                <StatCard
                    label="Pending approval"
                    value={loading ? "…" : pendingCount}
                    icon={Clock}
                    sub="need action"
                    href={`${base}/queries`}
                />
            </div>

            {/* ── Recent answers ───────────────────────────────────────────────── */}
            <div>
                <SectionHeader title="Recent queries" href={`${base}/queries`} />
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <Loader size={13} className="animate-adxc-spin" /> Loading…
                    </div>
                ) : recentAnswers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No queries yet.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {recentAnswers.map((answer) => (
                            <Link
                                key={answer.uuid}
                                href={`${base}/queries/${answer.uuid}?owner_member_id=${answer.owner_member_id ?? ""}&owner_kind=${answer.owner_kind}`}
                                className="group bg-card border p-4 flex flex-col gap-2 hover:border-border-3 transition-colors sm:flex-row sm:items-start sm:gap-4"
                            >
                                <div className="hidden sm:block mt-0.5 shrink-0">
                                    {answer.paid ? (
                                        <CheckCircle size={15} className="text-success" />
                                    ) : (
                                        <Clock size={15} className="text-warning" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                        {answer.question}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {timeAgo(answer.created_at)}
                                    </p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 shrink-0">
                                    <span className="text-sm font-medium tabular-nums">
                                        {formatTokens(answer.price)}
                                    </span>
                                    {answer.paid ? (
                                        <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">
                                            Approved
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs font-normal text-warning border-warning/40 bg-warning/5">
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Quick actions ────────────────────────────────────────────────── */}
            <div>
                <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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