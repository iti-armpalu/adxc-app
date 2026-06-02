"use client";

// app/(app)/admin/queries/page.tsx
//
// Platform admin — All queries across all organisations.
// Columns: status, when, org, question, price, paid, answer, trace
// TODO: wire to real API endpoints

import { useState, useMemo } from "react";
import { ExternalLink, SlidersHorizontal, X } from "lucide-react";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types + mock data ────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/queries

type QueryStatus = "success" | "pending" | "failed";

type Query = {
    id: string;
    org: string;
    orgId: number;
    question: string;
    status: QueryStatus;
    price: number;
    paid: boolean;
    when: string;
    hasAnswer: boolean;
    hasTrace: boolean;
    answerId?: string;
    traceId?: string;
};

const MOCK_QUERIES: Query[] = [
    {
        id: "q-001", org: "smoke_test", orgId: 1,
        question: "Tell me about the demographics of ford fans in the USA",
        status: "success", price: 22, paid: false,
        when: "2026-06-01T21:38:14.567850+00:00",
        hasAnswer: true, hasTrace: true, answerId: "ans-001",
    },
    {
        id: "q-002", org: "smoke_test", orgId: 1,
        question: "How do coke drinkers compare to average americans by age?",
        status: "success", price: 22, paid: true,
        when: "2026-06-01T17:06:32.283334+00:00",
        hasAnswer: true, hasTrace: true, answerId: "ans-002",
    },
    {
        id: "q-003", org: "smoke_test", orgId: 1,
        question: "Tell me about coke fans in US",
        status: "success", price: 22, paid: true,
        when: "2026-06-01T15:05:34.073134+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-003",
    },
    {
        id: "q-004", org: "smoke_test", orgId: 1,
        question: "Tell me about the demographics of coke fans in the UK",
        status: "success", price: 22, paid: true,
        when: "2026-06-01T14:08:11.084874+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-004",
    },
    {
        id: "q-005", org: "smoke_test", orgId: 1,
        question: "Tell me about the demographics of coke fans in the UK",
        status: "success", price: 22, paid: false,
        when: "2026-06-01T13:56:00.303803+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-005",
    },
    {
        id: "q-006", org: "smoke_test", orgId: 1,
        question: "Tell me about the demographics of coke fans",
        status: "success", price: 22, paid: true,
        when: "2026-05-31T19:41:31.204679+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-006",
    },
    {
        id: "q-007", org: "smoke_test", orgId: 1,
        question: "Tell me about economy of USA?",
        status: "success", price: 22, paid: false,
        when: "2026-05-31T11:34:44.737288+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-007",
    },
    {
        id: "q-008", org: "Josh_Test", orgId: 2,
        question: "What are the biggest barriers to consumption for alcohol free beer in the UK?",
        status: "success", price: 10, paid: true,
        when: "2026-05-08T08:37:09.008423+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-008",
    },
    {
        id: "q-009", org: "smoke_test", orgId: 1,
        question: "Tell me about how many people would consider buying coke in the USA",
        status: "success", price: 10, paid: true,
        when: "2026-05-06T18:41:14.747893+00:00",
        hasAnswer: true, hasTrace: false, answerId: "ans-009",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(diffMs / 3600000);
    const d = Math.floor(diffMs / 86400000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return "Yesterday";
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QueryStatus, { label: string; className: string }> = {
    success: { label: "Success", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending: { label: "Pending", className: "bg-orange-100 text-orange-700 border-orange-200" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700 border-red-200" },
};

function StatusBadge({ status }: { status: QueryStatus }) {
    const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed;
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border whitespace-nowrap",
            c.className
        )}>
            {c.label}
        </span>
    );
}

function PaidBadge({ paid }: { paid: boolean }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border whitespace-nowrap",
            paid
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
        )}>
            {paid ? "Paid" : "Unpaid"}
        </span>
    );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

const ALL = "_all";

function Filters({
    statusFilter, paidFilter, orgFilter, orgs,
    onStatus, onPaid, onOrg, onClear, hasActive,
}: {
    statusFilter: string; paidFilter: string; orgFilter: string;
    orgs: string[];
    onStatus: (v: string) => void; onPaid: (v: string) => void; onOrg: (v: string) => void;
    onClear: () => void; hasActive: boolean;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} strokeWidth={1.8} className="text-muted-foreground shrink-0" />

            <Select value={statusFilter} onValueChange={onStatus}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
            </Select>

            <Select value={paidFilter} onValueChange={onPaid}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Paid & unpaid</SelectItem>
                    <SelectItem value="paid">Paid only</SelectItem>
                    <SelectItem value="unpaid">Unpaid only</SelectItem>
                </SelectContent>
            </Select>

            <Select value={orgFilter} onValueChange={onOrg}>
                <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue placeholder="All orgs" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All orgs</SelectItem>
                    {orgs.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
            </Select>

            {hasActive && (
                <Button
                    variant="ghost" size="sm" onClick={onClear}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                    <X size={12} strokeWidth={2} /> Clear
                </Button>
            )}
        </div>
    );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function QueriesTable({ queries }: { queries: Query[] }) {
    if (queries.length === 0) {
        return (
            <div className="rounded-xl border border-border flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">No queries match the current filters.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[90px_120px_110px_1fr_60px_80px_70px_60px] gap-3 px-5 py-3 bg-accent/50 border-b border-border">
                {["Status", "When", "Org", "Question", "Price", "Paid", "Answer", "Trace"].map((h, i) => (
                    <span key={h} className={cn(
                        "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                        i >= 4 && "text-right",
                        i === 5 && "text-center",
                        i >= 6 && "text-center",
                    )}>
                        {h}
                    </span>
                ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
                {queries.map((q) => (
                    <div
                        key={q.id}
                        className="grid grid-cols-[90px_120px_110px_1fr_60px_80px_70px_60px] gap-3 items-start px-5 py-4 hover:bg-accent/30 transition-colors duration-100"
                    >
                        {/* Status */}
                        <div className="pt-0.5"><StatusBadge status={q.status} /></div>

                        {/* When */}
                        <span
                            className="text-xs text-muted-foreground pt-0.5 cursor-default"
                            title={formatDateTime(q.when)}
                        >
                            {formatRelativeTime(q.when)}
                        </span>

                        {/* Org */}
                        <div className="pt-0.5 flex flex-col gap-0.5 min-w-0">
                            <a
                                href={`/admin/organisations/${q.orgId}`}
                                className="text-xs font-medium text-foreground hover:text-primary hover:underline transition-colors truncate"
                            >
                                {q.org}
                            </a>
                            <span className="text-[10px] text-muted-foreground font-mono">#{q.orgId}</span>
                        </div>

                        {/* Question */}
                        <p className="m-0 text-sm text-foreground tracking-[-0.01em] leading-snug line-clamp-2">
                            {q.question}
                        </p>

                        {/* Price */}
                        <span className="text-sm font-medium text-foreground tabular-nums text-right pt-0.5">
                            ${q.price}
                        </span>

                        {/* Paid */}
                        <div className="flex justify-center pt-0.5">
                            <PaidBadge paid={q.paid} />
                        </div>

                        {/* Answer */}
                        <div className="flex justify-center pt-0.5">
                            {q.hasAnswer ? (
                                <a
                                    href={`/admin/organisations/${q.orgId}/answers/${q.answerId}`}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
                                >
                                    View <ExternalLink size={10} strokeWidth={2} />
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                            )}
                        </div>

                        {/* Trace */}
                        <div className="flex justify-center pt-0.5">
                            {q.hasTrace ? (
                                <a
                                    href={`/admin/queries/${q.id}/trace`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
                                >
                                    Trace <ExternalLink size={10} strokeWidth={2} />
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QueriesPage() {
    const [statusFilter, setStatusFilter] = useState(ALL);
    const [paidFilter, setPaidFilter] = useState(ALL);
    const [orgFilter, setOrgFilter] = useState(ALL);

    const orgs = useMemo(() => [...new Set(MOCK_QUERIES.map(q => q.org))].sort(), []);

    const filtered = useMemo(() => MOCK_QUERIES.filter(q => {
        if (statusFilter !== ALL && q.status !== statusFilter) return false;
        if (paidFilter !== ALL && (paidFilter === "paid" ? !q.paid : q.paid)) return false;
        if (orgFilter !== ALL && q.org !== orgFilter) return false;
        return true;
    }), [statusFilter, paidFilter, orgFilter]);

    const totalSpend = filtered.reduce((s, q) => s + q.price, 0);
    const paidCount = filtered.filter(q => q.paid).length;
    const hasActive = statusFilter !== ALL || paidFilter !== ALL || orgFilter !== ALL;

    return (
        <div className="p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-foreground">Queries</h2>
                    <p className="m-0 text-sm text-muted-foreground tracking-wide">
                        Every query across all organisations, most recent first.
                    </p>
                </div>

                {/* Live summary */}
                <div className="flex items-center gap-3 shrink-0 pt-1 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Showing</span>
                        <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span>
                    </div>
                    <span className="text-border-3 text-xs">·</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-semibold text-foreground tabular-nums">
                            {paidCount}/{filtered.length}
                        </span>
                    </div>
                    <span className="text-border-3 text-xs">·</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold text-foreground tabular-nums">${totalSpend}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Filters
                statusFilter={statusFilter}
                paidFilter={paidFilter}
                orgFilter={orgFilter}
                orgs={orgs}
                onStatus={setStatusFilter}
                onPaid={setPaidFilter}
                onOrg={setOrgFilter}
                onClear={() => { setStatusFilter(ALL); setPaidFilter(ALL); setOrgFilter(ALL); }}
                hasActive={hasActive}
            />

            {/* Table */}
            <QueriesTable queries={filtered} />

        </div>
    );
}