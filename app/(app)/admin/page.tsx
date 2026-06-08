"use client";

import Link from "next/link";
import {
    Users,
    Building2,
    FileText,
    Clock,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Mock data
// TODO: GET /v1/users              → MOCK_RECENT_USERS
// TODO: GET /v2/admin/orgs         → MOCK_STATS.activeOrgs
// TODO: platform-wide queries list → MOCK_PENDING_QUERIES, MOCK_RECENT_QUERIES, stats
// ---------------------------------------------------------------------------

const MOCK_STATS = {
    totalUsers: 10,  // GET /v1/users → users.length
    activeOrgs: 8,  // GET /v2/admin/orgs → orgs.filter(!deleted_at).length
    totalQueries: 143,  // TODO: no platform-wide queries endpoint yet
    pendingApproval: 4,  // TODO: no platform-wide queries endpoint yet
};

const MOCK_RECENT_USERS = [
    { id: "usr_01", username: "alice.morgan", created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: "usr_02", username: "sarah.chen", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: "usr_03", username: "james.whitfield", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: "usr_04", username: "priya.nair", created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: "usr_05", username: "isabelle.martin", created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];

const MOCK_PENDING_QUERIES = [
    {
        uuid: "ans_9a1b2c3d",
        question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?",
        price: "12.50",
        org_id: 1,
        org_name: "Unilever Global Insights",
        created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    },
    {
        uuid: "ans_4e5f6g7h",
        question: "How does Reddit sentiment on EV brands compare to X sentiment in Q1 2025?",
        price: "8.00",
        org_id: 2,
        org_name: "Nike Consumer Intelligence",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        uuid: "ans_7u8v9w0x",
        question: "What are current consumer attitudes toward luxury resale platforms in Western Europe?",
        price: "22.00",
        org_id: 8,
        org_name: "LVMH Brand Intelligence",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
        uuid: "ans_9g0h1i2j",
        question: "What is the share of voice for Heineken versus craft beer brands on social media in Germany?",
        price: "11.00",
        org_id: 9,
        org_name: "Heineken Consumer Insights",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    },
];

const MOCK_RECENT_QUERIES = [
    {
        uuid: "ans_8i9j0k1l",
        question: "What percentage of US households earning over $100k use meal-kit delivery services?",
        price: "6.50",
        paid: true,
        org_id: 4,
        org_name: "Procter & Gamble Brand Strategy",
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
        uuid: "ans_2m3n4o5p",
        question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.",
        price: "15.00",
        paid: true,
        org_id: 1,
        org_name: "Unilever Global Insights",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
        uuid: "ans_3q4r5s6t",
        question: "How has Diageo's Guinness brand perception shifted among women aged 21–35 in the US since 2022?",
        price: "18.00",
        paid: true,
        org_id: 5,
        org_name: "Diageo Audience Labs",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
        uuid: "ans_1y2z3a4b",
        question: "Spotify vs Apple Music brand loyalty metrics among premium subscribers in the Nordics.",
        price: "9.50",
        paid: true,
        org_id: 10,
        org_name: "Spotify Audience Research",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
}

function initials(username: string) {
    return username.slice(0, 2).toUpperCase();
}

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

const PENDING_QUERIES_URL = "/admin/queries?status=pending";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
    label, value, icon: Icon, sub, href,
}: {
    label: string; value: number | string;
    icon: React.ElementType; sub?: string; href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col gap-3 bg-card border p-4 hover:border-border-3 transition-colors"
        >
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="w-7 h-7 bg-accent flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <Icon size={13} />
                </div>
            </div>
            <div className="flex items-end justify-between gap-2">
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
                {sub && <span className="text-xs text-muted-foreground mb-0.5">{sub}</span>}
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

export default function AdminOverviewPage() {
    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Page title ───────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Platform health at a glance.
                </p>
            </div>

            {/* ── Stat cards ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Total users"
                    value={MOCK_STATS.totalUsers}
                    icon={Users}
                    href="/admin/users"
                />
                <StatCard
                    label="Active orgs"
                    value={MOCK_STATS.activeOrgs}
                    icon={Building2}
                    href="/admin/organisations"
                />
                <StatCard
                    label="Total queries"
                    value={MOCK_STATS.totalQueries}
                    icon={FileText}
                    sub="all time"
                    href="/admin/queries"
                />
                <StatCard
                    label="Pending approval"
                    value={MOCK_STATS.pendingApproval}
                    icon={Clock}
                    sub="need action"
                    href={PENDING_QUERIES_URL}
                />
            </div>

            {/* ── Two column content ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* ── Pending approval ─────────────────────────────────────────── */}
                <div>
                    <SectionHeader
                        title="Pending approval"
                        href={PENDING_QUERIES_URL}
                    />
                    <div className="flex flex-col gap-2">
                        {MOCK_PENDING_QUERIES.map((query) => {
                            const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_kind=member`;
                            return (
                                <Link
                                    key={query.uuid}
                                    href={detailHref}
                                    className="group bg-card border p-4 flex flex-col gap-2.5 hover:border-border-3 transition-colors"
                                >
                                    <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                        {query.question}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs text-muted-foreground truncate">
                                                {query.org_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                · {timeAgo(query.created_at)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums shrink-0">
                                            {formatCurrency(query.price)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right column ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-6">

                    {/* Recent queries */}
                    <div>
                        <SectionHeader
                            title="Recent queries"
                            href="/admin/queries"
                        />
                        <div className="bg-card border overflow-hidden">
                            {MOCK_RECENT_QUERIES.map((query, i) => {
                                const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_kind=member`;
                                return (
                                    <Link
                                        key={query.uuid}
                                        href={detailHref}
                                        className={`group flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors ${i < MOCK_RECENT_QUERIES.length - 1 ? "border-b border-border" : ""
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate group-hover:text-primary transition-colors">
                                                {query.question}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {query.org_name}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                                            <span className="text-xs font-medium tabular-nums">
                                                {formatCurrency(query.price)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(query.created_at)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent users */}
                    <div>
                        <SectionHeader title="Recent users" href="/admin/users" />
                        <div className="bg-card border overflow-hidden">
                            {MOCK_RECENT_USERS.map((user, i) => (
                                <Link
                                    key={user.id}
                                    href="/admin/users"
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors ${i < MOCK_RECENT_USERS.length - 1 ? "border-b border-border" : ""
                                        }`}
                                >
                                    <Avatar className="w-7 h-7 shrink-0">
                                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                            {initials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium flex-1 truncate">
                                        {user.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {timeAgo(user.created_at)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}