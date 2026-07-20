"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    Building2,
    FileText,
    Clock,
    ArrowRight,
    Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnswerListItemResponse, OrgSummaryResponse } from "@/lib/api-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecentUser = {
    id: string;
    username: string;
    created_at: string;
};

type QueryItem = {
    uuid: string;
    question: string;
    price: string;
    paid: boolean;
    org_id: string;
    org_name: string;
    owner_member_id: number | null;
    owner_kind: "member" | "org_automation";
    created_at: string;
};



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

function formatTokens(value: string) {
    const n = parseFloat(value);
    if (isNaN(n)) return "—";
    return `${new Intl.NumberFormat("en-US").format(n)} tokens`;
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
    const [totalUsers, setTotalUsers] = useState<number | "…">("…");
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [activeOrgs, setActiveOrgs] = useState<number | "…">("…");
    const [allQueries, setAllQueries] = useState<QueryItem[]>([]);
    const [queriesLoading, setQueriesLoading] = useState(true);

    // GET /v2/admin/users → user count + recent users list
    useEffect(() => {
        fetch("/api/users")
            .then((r) => r.json())
            .then((data) => {
                const users: RecentUser[] = data.users ?? [];
                setTotalUsers(users.length);
                const sorted = [...users].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setRecentUsers(sorted.slice(0, 5));
            })
            .catch(() => { });
    }, []);

    // GET /api/admin/orgs → active org count
    useEffect(() => {
        fetch("/api/admin/orgs")
            .then((r) => r.json())
            .then((data) => {
                const orgs = data.orgs ?? [];
                setActiveOrgs(orgs.filter((o: { deleted_at: string | null }) => !o.deleted_at).length);
            })
            .catch(() => { });
    }, []);

    // Fan-out: GET /v2/orgs → GET /v2/orgs/{org_id}/answers per org, merge results
    useEffect(() => {
        fetch("/api/orgs")
            .then((r) => r.json())
            .then(async (data) => {
                const orgs: OrgSummaryResponse[] = data.orgs ?? [];
                const results = await Promise.allSettled(
                    orgs.map((o) =>
                        fetch(`/api/orgs/${o.org_id}/answers`)
                            .then((r) => r.json())
                            .then((d) => ({ org: o, answers: d.answers ?? [] }))
                    )
                );
                const merged: QueryItem[] = [];
                results.forEach((result) => {
                    if (result.status === "fulfilled") {
                        const { org, answers } = result.value;
                        answers.forEach((a: AnswerListItemResponse) => {
                            merged.push({
                                uuid: a.uuid,
                                question: a.question,
                                price: a.price,
                                paid: a.paid,
                                org_id: org.org_id,
                                org_name: org.org_name,
                                owner_member_id: a.owner_member_id,
                                owner_kind: a.owner_kind,
                                created_at: a.created_at,
                            });
                        });
                    }
                });
                merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setAllQueries(merged);
            })
            .catch(() => { })
            .finally(() => setQueriesLoading(false));
    }, []);

    const pendingQueries = allQueries.filter((q) => !q.paid).slice(0, 4);
    const recentApproved = allQueries.filter((q) => q.paid).slice(0, 4);

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
                    value={totalUsers}
                    icon={Users}
                    href="/admin/users"
                />
                <StatCard
                    label="Active orgs"
                    value={activeOrgs}
                    icon={Building2}
                    href="/admin/organisations"
                />
                <StatCard
                    label="Total queries"
                    value={queriesLoading ? "…" : allQueries.length}
                    icon={FileText}
                    sub="all time"
                    href="/admin/queries"
                />
                <StatCard
                    label="Pending approval"
                    value={queriesLoading ? "…" : allQueries.filter((q) => !q.paid).length}
                    icon={Clock}
                    sub="need action"
                    href={PENDING_QUERIES_URL}
                />
            </div>

            {/* ── Two column content ───────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">

                {/* ── Pending approval — hidden when empty ─────────────────────── */}
                {pendingQueries.length > 0 && (
                    <div>
                        <SectionHeader title="Pending approval" href={PENDING_QUERIES_URL} />
                        <div className="bg-card border overflow-hidden">
                            {queriesLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-4">
                                    <Loader size={13} className="animate-adxc-spin" /> Loading…
                                </div>
                            )}
                            {pendingQueries.map((query, i) => {
                                const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`;
                                return (
                                    <Link
                                        key={query.uuid}
                                        href={detailHref}
                                        className={`group flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors ${i < pendingQueries.length - 1 ? "border-b border-border" : ""}`}
                                    >
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                {query.question}
                                            </p>
                                            <span className="text-xs text-muted-foreground shrink-0">·</span>
                                            <p className="text-xs text-muted-foreground shrink-0">
                                                {query.org_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-sm font-semibold tabular-nums">
                                                {formatTokens(query.price)}
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
                )}

                {/* ── Recent queries ───────────────────────────────────────────── */}
                <div>
                    <SectionHeader title="Recent queries" href="/admin/queries" />
                    <div className="bg-card border overflow-hidden">
                        {queriesLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-4">
                                <Loader size={13} className="animate-adxc-spin" /> Loading…
                            </div>
                        )}
                        {recentApproved.map((query, i) => {
                            const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`;
                            return (
                                <Link
                                    key={query.uuid}
                                    href={detailHref}
                                    className={`group flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors ${i < recentApproved.length - 1 ? "border-b border-border" : ""}`}
                                >
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {query.question}
                                        </p>
                                        <span className="text-xs text-muted-foreground shrink-0">·</span>
                                        <p className="text-xs text-muted-foreground shrink-0">
                                            {query.org_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm font-semibold tabular-nums">
                                            {formatTokens(query.price)}
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

                {/* ── Recent users ─────────────────────────────────────────────── */}
                <div>
                    <SectionHeader title="Recent users" href="/admin/users" />
                    <div className="bg-card border overflow-hidden">
                        {recentUsers.map((user, i) => (
                            <Link
                                key={user.id}
                                href="/admin/users"
                                className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors ${i < recentUsers.length - 1 ? "border-b border-border" : ""}`}
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
    );
}