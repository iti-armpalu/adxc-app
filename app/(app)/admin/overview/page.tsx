"use client";

// app/(app)/admin/overview/page.tsx
//
// Platform admin overview. Landing page after login.
// Stat cards link to their respective pages.
// TODO: wire up all data to real API endpoints

import Link from "next/link";
import { Building2, Users, SearchCode, DollarSign, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/stats

const STATS = [
    {
        label: "Total users",
        value: "8",
        icon: Users,
        sub: "Active accounts",
        href: "/admin/users",
        accent: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        label: "Organisations",
        value: "6",
        icon: Building2,
        sub: "Active orgs",
        href: "/admin/organisations",
        accent: "text-purple-600",
        bg: "bg-purple-50",
    },
    {
        label: "Queries run",
        value: "9",
        icon: SearchCode,
        sub: "All time",
        href: "/admin/queries",
        accent: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        label: "Total spend",
        value: "$184",
        icon: DollarSign,
        sub: "Across all orgs",
        href: "/admin/queries?paid=paid",
        accent: "text-orange-600",
        bg: "bg-orange-50",
    },
];

const RECENT_QUERIES = [
    {
        id: "q-001", org: "smoke_test", orgId: 1, answerId: "ans-001",
        question: "Tell me about the demographics of ford fans in the USA",
        status: "success", price: 22, paid: false,
        when: "2026-06-01T21:38:14.567850+00:00",
    },
    {
        id: "q-002", org: "smoke_test", orgId: 1, answerId: "ans-002",
        question: "How do coke drinkers compare to average americans by age?",
        status: "success", price: 22, paid: true,
        when: "2026-06-01T17:06:32.283334+00:00",
    },
    {
        id: "q-003", org: "smoke_test", orgId: 1, answerId: "ans-003",
        question: "Tell me about coke fans in US",
        status: "success", price: 22, paid: true,
        when: "2026-06-01T15:05:34.073134+00:00",
    },
    {
        id: "q-004", org: "Josh_Test", orgId: 2, answerId: "ans-008",
        question: "What are the biggest barriers to consumption for alcohol free beer in the UK?",
        status: "success", price: 10, paid: true,
        when: "2026-05-08T08:37:09.008423+00:00",
    },
    {
        id: "q-005", org: "smoke_test", orgId: 1, answerId: "ans-009",
        question: "Tell me about how many people would consider buying coke in the USA",
        status: "success", price: 10, paid: true,
        when: "2026-05-06T18:41:14.747893+00:00",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diffMs / 86400000);
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor(diffMs / 60000);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return "Yesterday";
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
}

const STATUS_STYLES: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    failed: "bg-red-100 text-red-700 border-red-200",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    label, value, icon: Icon, sub, href, accent, bg,
}: {
    label: string; value: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    sub: string; href: string; accent: string; bg: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 gap-4 hover:border-border-3 hover:shadow-sm transition-all duration-150"
        >
            {/* Top row — icon + label */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground tracking-[-0.01em]">
                    {label}
                </span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon size={15} strokeWidth={1.8} className={accent} />
                </div>
            </div>

            {/* Value */}
            <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[32px] font-bold tracking-[-0.03em] text-foreground leading-none">
                        {value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {sub}
                    </span>
                </div>
                <ArrowRight
                    size={14}
                    strokeWidth={2}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 mb-0.5 shrink-0"
                />
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {

    return (
        <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-8">

            {/* Page header */}
            <div className="flex flex-col gap-1">
                <h2 className="m-0 text-foreground">Overview</h2>
                <p className="m-0 text-sm text-muted-foreground tracking-wide">
                    Platform activity at a glance.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Recent queries */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h4 className="m-0 text-foreground">Recent queries</h4>
                    <Link
                        href="/admin/queries"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline tracking-[-0.01em] transition-colors"
                    >
                        View all
                        <ArrowRight size={13} strokeWidth={2} />
                    </Link>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="divide-y divide-border">
                        {RECENT_QUERIES.map((q) => (
                            <Link
                                key={q.id}
                                href={`/admin/organisations/${q.orgId}/answers/${q.answerId}`}
                                className="flex items-start gap-4 px-5 py-4 hover:bg-accent/40 transition-colors duration-100 group"
                            >
                                {/* Status */}
                                <div className="pt-0.5 shrink-0">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                                        STATUS_STYLES[q.status] ?? STATUS_STYLES.failed
                                    )}>
                                        {q.status}
                                    </span>
                                </div>

                                {/* Question + org */}
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 text-sm text-foreground tracking-[-0.01em] leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-100">
                                        {q.question}
                                    </p>
                                    <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                                        {q.org}
                                    </p>
                                </div>

                                {/* Paid badge */}
                                <div className="pt-0.5 shrink-0">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                                        q.paid
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-neutral-100 text-neutral-500 border-neutral-200"
                                    )}>
                                        {q.paid ? "Paid" : "Unpaid"}
                                    </span>
                                </div>

                                {/* Price + time */}
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    <span className="text-sm font-semibold text-foreground tabular-nums">
                                        ${q.price}
                                    </span>
                                    <span
                                        className="text-xs text-muted-foreground"
                                        title={new Date(q.when).toLocaleString()}
                                    >
                                        {formatRelativeTime(q.when)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}