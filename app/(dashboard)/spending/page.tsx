"use client";

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Edit2,
    Save,
    X,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Bell,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET  /v2/orgs/{org_id}/spending/limits      → SpendLimitsResponse
// PUT  /v2/orgs/{org_id}/spending/limits      → SpendLimitsResponse
// GET  /v2/orgs/{org_id}/spending/breakdown   → SpendBreakdownResponse
// GET  /v2/orgs/{org_id}/spending/by-user     → SpendByUserResponse
// GET  /v2/orgs/{org_id}/spending/queries     → QuerySpendResponse (paginated)

const MOCK_LIMITS = {
    monthly_cap: 500,
    spent_this_month: 127.5,
    warn_threshold_pct: 70,
    warn_alerts_enabled: true,
    block_at_cap: true,
    per_query_cap: 25,
    per_user_cap_enabled: false,
    per_user_cap: 100,
};

const MOCK_PROVIDER_BREAKDOWN = [
    { provider: "YouGov", spend: 48.6, queries: 9, color: "bg-brand-600" },
    { provider: "Reddit", spend: 31.2, queries: 7, color: "bg-brand-400" },
    { provider: "X (Twitter)", spend: 22.4, queries: 4, color: "bg-neutral-600" },
    { provider: "QUID", spend: 14.8, queries: 3, color: "bg-brand-300" },
    { provider: "US Census", spend: 10.5, queries: 3, color: "bg-neutral-400" },
];

const MOCK_USER_SPEND = [
    { name: "Maya Chen", initials: "MC", role: "Admin", spend: 54.2, queries: 10 },
    { name: "James Okafor", initials: "JO", role: "Strategist", spend: 38.9, queries: 7 },
    { name: "Priya Nair", initials: "PN", role: "Strategist", spend: 22.1, queries: 4 },
    { name: "Tom Reeves", initials: "TR", role: "Analyst", spend: 12.3, queries: 2 },
];

const MOCK_RECENT_QUERIES = [
    {
        id: "qry_4492",
        question: "Which demographics are most receptive to sustainable luxury brands in the UK?",
        providers: ["YouGov", "Reddit"],
        cost: 8.2,
        user: "Maya Chen",
        ts: "27 May, 08:51",
        status: "completed",
    },
    {
        id: "qry_4491",
        question: "US household income distribution by metropolitan area, 2024",
        providers: ["US Census"],
        cost: 3.1,
        user: "James Okafor",
        ts: "26 May, 16:33",
        status: "completed",
    },
    {
        id: "qry_4488",
        question: "Sentiment around EV adoption among 25–40 year olds, Q1 2026",
        providers: ["X (Twitter)", "QUID"],
        cost: 11.4,
        user: "Maya Chen",
        ts: "26 May, 11:02",
        status: "completed",
    },
    {
        id: "qry_4471",
        question: "Brand trust scores for challenger banks across Europe",
        providers: ["YouGov"],
        cost: 4.8,
        user: "Priya Nair",
        ts: "24 May, 14:20",
        status: "completed",
    },
    {
        id: "qry_4455",
        question: "Conversation volume and tone around climate policy on social, April 2026",
        providers: ["Reddit", "X (Twitter)"],
        cost: 9.6,
        user: "James Okafor",
        ts: "22 May, 10:15",
        status: "completed",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
    return `$${n.toFixed(2)}`;
}

function pct(part: number, total: number) {
    return Math.min(Math.round((part / total) * 100), 100);
}

// ─── Spend cap inline editor ──────────────────────────────────────────────────

function SpendCapEditor({
    initialCap,
    spent,
}: {
    initialCap: number;
    spent: number;
}) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initialCap.toString());
    const [saved, setSaved] = useState(initialCap);

    const usedPct = pct(spent, saved);
    const isWarning = usedPct >= 70 && usedPct < 100;
    const isBlocked = usedPct >= 100;

    function handleSave() {
        const n = parseFloat(value);
        if (!isNaN(n) && n >= 10) {
            // TODO: PUT /v2/orgs/{org_id}/spending/limits { monthly_cap: n }
            setSaved(n);
        }
        setEditing(false);
    }

    function handleCancel() {
        setValue(saved.toString());
        setEditing(false);
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                        Monthly spend cap
                    </CardTitle>
                    {!editing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={() => setEditing(true)}
                        >
                            <Edit2 size={11} />
                            Edit
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Queries are blocked once this limit is reached.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {/* Cap value */}
                <div className="flex items-end gap-3">
                    {editing ? (
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1 max-w-[160px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    type="number"
                                    min="10"
                                    step="50"
                                    className="pl-7 h-10 text-lg font-bold"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button size="sm" className="h-10 gap-1.5" onClick={handleSave}>
                                <Save size={13} />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 gap-1"
                                onClick={handleCancel}
                            >
                                <X size={13} />
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-[-0.03em] text-foreground">
                                {formatCurrency(saved)}
                            </span>
                            <span className="text-sm text-muted-foreground">/ month</span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-2">
                    <div className="w-full h-2.5 bg-muted rounded-xs overflow-hidden">
                        <div
                            className={`h-full rounded-xs transition-all duration-500 ${isBlocked
                                    ? "bg-destructive"
                                    : isWarning
                                        ? "bg-orange-500"
                                        : "bg-primary"
                                }`}
                            style={{ width: `${usedPct}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {formatCurrency(spent)} used · {formatCurrency(saved - spent)} remaining
                        </span>
                        <span
                            className={`text-xs font-semibold ${isBlocked
                                    ? "text-destructive"
                                    : isWarning
                                        ? "text-orange-600"
                                        : "text-muted-foreground"
                                }`}
                        >
                            {usedPct}%
                            {isBlocked && " — queries blocked"}
                            {isWarning && " — approaching limit"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Provider breakdown ───────────────────────────────────────────────────────

function ProviderBreakdown() {
    const total = MOCK_PROVIDER_BREAKDOWN.reduce((s, p) => s + p.spend, 0);
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Spend by provider
                </CardTitle>
                <CardDescription>May 2026 · all queries</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {MOCK_PROVIDER_BREAKDOWN.map((p) => {
                    const share = pct(p.spend, total);
                    return (
                        <div key={p.provider} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {p.provider}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {p.queries} {p.queries === 1 ? "query" : "queries"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {share}%
                                    </span>
                                    <span className="text-sm font-semibold text-foreground tabular-nums w-14 text-right">
                                        {formatCurrency(p.spend)}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-xs overflow-hidden">
                                <div
                                    className={`h-full rounded-xs ${p.color}`}
                                    style={{ width: `${share}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

// ─── Per-user spend ───────────────────────────────────────────────────────────

function UserSpendBreakdown() {
    const max = Math.max(...MOCK_USER_SPEND.map((u) => u.spend));
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold">
                            Spend by user
                        </CardTitle>
                        <CardDescription>May 2026</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        asChild
                    >
                        <a href="/users">Manage users</a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-0 divide-y divide-border">
                {MOCK_USER_SPEND.map((u) => (
                    <div key={u.name} className="flex items-center gap-3 py-3">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-brand-700">
                                {u.initials}
                            </span>
                        </div>
                        {/* Name + bar */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {u.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        · {u.queries} {u.queries === 1 ? "query" : "queries"}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-foreground tabular-nums ml-3 shrink-0">
                                    {formatCurrency(u.spend)}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-xs overflow-hidden">
                                <div
                                    className="h-full rounded-xs bg-brand-400 transition-all duration-500"
                                    style={{ width: `${pct(u.spend, max)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// ─── Alert thresholds ─────────────────────────────────────────────────────────

function AlertThresholds() {
    const [warnEnabled, setWarnEnabled] = useState(
        MOCK_LIMITS.warn_alerts_enabled
    );
    const [warnThreshold, setWarnThreshold] = useState(
        MOCK_LIMITS.warn_threshold_pct.toString()
    );
    const [blockAtCap, setBlockAtCap] = useState(MOCK_LIMITS.block_at_cap);
    const [perQueryCap, setPerQueryCap] = useState(
        MOCK_LIMITS.per_query_cap.toString()
    );
    const [perUserEnabled, setPerUserEnabled] = useState(
        MOCK_LIMITS.per_user_cap_enabled
    );
    const [perUserCap, setPerUserCap] = useState(
        MOCK_LIMITS.per_user_cap.toString()
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Alerts & controls
                </CardTitle>
                <CardDescription>
                    Configure when to warn and when to block.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">

                {/* Warning alert */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                        <Bell size={15} className="text-orange-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Warn when spend reaches
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Send an email alert to all admins.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Select
                            value={warnThreshold}
                            onValueChange={(v) => {
                                setWarnThreshold(v);
                                // TODO: PUT /v2/orgs/{org_id}/spending/limits { warn_threshold_pct: parseInt(v) }
                            }}
                            disabled={!warnEnabled}
                        >
                            <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[50, 60, 70, 80, 90].map((v) => (
                                    <SelectItem key={v} value={v.toString()}>
                                        {v}%
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Switch
                            checked={warnEnabled}
                            onCheckedChange={(v) => {
                                setWarnEnabled(v);
                                // TODO: PUT /v2/orgs/{org_id}/spending/limits { warn_alerts_enabled: v }
                            }}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                    </div>
                </div>

                <Separator />

                {/* Block at cap */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                        <ShieldAlert size={15} className="text-destructive mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Block queries at cap
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Prevent any query from running once the monthly cap is hit.
                                Turning this off allows overspend.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={blockAtCap}
                        onCheckedChange={(v) => {
                            setBlockAtCap(v);
                            // TODO: PUT /v2/orgs/{org_id}/spending/limits { block_at_cap: v }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    />
                </div>

                <Separator />

                {/* Per-query cap */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Per-query cost cap
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Block any single query priced above this amount before approval.
                            </p>
                        </div>
                    </div>
                    <div className="relative w-24 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            $
                        </span>
                        <Input
                            type="number"
                            min="1"
                            step="5"
                            className="pl-6 h-8 text-sm text-right pr-3"
                            value={perQueryCap}
                            onChange={(e) => {
                                setPerQueryCap(e.target.value);
                                // TODO: PUT /v2/orgs/{org_id}/spending/limits { per_query_cap: parseFloat(e.target.value) }
                            }}
                        />
                    </div>
                </div>

                <Separator />

                {/* Per-user cap */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Per-user monthly cap
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Limit how much any single team member can spend per month.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="relative w-24">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                $
                            </span>
                            <Input
                                type="number"
                                min="1"
                                step="10"
                                className="pl-6 h-8 text-sm text-right pr-3"
                                value={perUserCap}
                                disabled={!perUserEnabled}
                                onChange={(e) => {
                                    setPerUserCap(e.target.value);
                                    // TODO: PUT /v2/orgs/{org_id}/spending/limits { per_user_cap: parseFloat(e.target.value) }
                                }}
                            />
                        </div>
                        <Switch
                            checked={perUserEnabled}
                            onCheckedChange={(v) => {
                                setPerUserEnabled(v);
                                // TODO: PUT /v2/orgs/{org_id}/spending/limits { per_user_cap_enabled: v }
                            }}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

// ─── Query cost list ──────────────────────────────────────────────────────────

function QueryCostList() {
    const [filter, setFilter] = useState("all");

    const sorted = [...MOCK_RECENT_QUERIES].sort((a, b) =>
        filter === "highest" ? b.cost - a.cost : 0
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                    Query costs — May 2026
                </p>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Most recent</SelectItem>
                        <SelectItem value="highest">Highest cost</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* TODO: wire up GET /v2/orgs/{org_id}/spending/queries?month=2026-05&sort={filter} */}
            <Card>
                <CardContent className="pt-1 pb-1 px-5">
                    {sorted.map((q, i) => (
                        <div
                            key={q.id}
                            className={`flex items-start gap-3 py-3.5 ${i !== sorted.length - 1 ? "border-b border-border" : ""
                                }`}
                        >
                            {/* Cost badge */}
                            <div className="w-14 shrink-0 pt-0.5">
                                <span className="text-sm font-bold text-foreground tabular-nums">
                                    {formatCurrency(q.cost)}
                                </span>
                            </div>

                            {/* Question + meta */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground line-clamp-2 leading-snug">
                                    {q.question}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {q.providers.map((p) => (
                                        <Badge
                                            key={p}
                                            variant="secondary"
                                            className="text-xs h-5 px-1.5 font-normal"
                                        >
                                            {p}
                                        </Badge>
                                    ))}
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">
                                        {q.user}
                                    </span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} />
                                        {q.ts}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0 mt-0.5"
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* TODO: paginate */}
            <Button variant="outline" className="self-center text-xs h-8 px-4">
                Load more
                <ChevronDown size={13} className="ml-1.5" />
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpendingPage() {
    const delta = Math.round(
        ((MOCK_LIMITS.spent_this_month - 203.8) / 203.8) * 100
    );
    const isDown = delta < 0;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">
                        DEPT
                    </p>
                    <h2>Spending & limits</h2>
                </div>
                {/* Month-over-month summary */}
                <div className="flex items-center gap-1.5 text-sm shrink-0 mt-1">
                    {isDown ? (
                        <TrendingDown size={15} className="text-emerald-600" />
                    ) : (
                        <TrendingUp size={15} className="text-orange-500" />
                    )}
                    <span
                        className={`font-semibold ${isDown ? "text-emerald-700" : "text-orange-600"
                            }`}
                    >
                        {Math.abs(delta)}% vs last month
                    </span>
                    <span className="text-muted-foreground text-xs">
                        (${MOCK_LIMITS.spent_this_month.toFixed(2)} vs $203.80)
                    </span>
                </div>
            </div>

            {/* ── Spend cap (inline editable) ── */}
            <SpendCapEditor
                initialCap={MOCK_LIMITS.monthly_cap}
                spent={MOCK_LIMITS.spent_this_month}
            />

            {/* ── Breakdown grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProviderBreakdown />
                <UserSpendBreakdown />
            </div>

            <Separator />

            {/* ── Alert thresholds ── */}
            <AlertThresholds />

            <Separator />

            {/* ── Query cost list ── */}
            <QueryCostList />

        </div>
    );
}