// ---------------------------------------------------------------------------
// Admin queries page
// No platform-wide answers endpoint exists in the spec.
// Workaround: fan-out across GET /v2/orgs/{org_id}/answers for each org
// the current admin user is a member of, then merge results.
// Only shows answers from orgs the admin has a membership row in.
// TODO: replace with GET /v2/admin/answers when Rob adds it
// ---------------------------------------------------------------------------
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    X,
    Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AnswerListItemResponse, MembershipResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueryRecord = {
    uuid: string;
    question: string;
    price: string;
    paid: boolean;
    org_id: string;   // UUID string
    org_name: string;
    owner_kind: "member" | "org_automation";
    owner_member_id: number | null;
    owner_api_key_id: number | null;
    created_at: string;
    paid_at: string | null;
};

type SortKey = "created_at" | "price" | "org_name";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "pending" | "approved";
type OrgFilter = string[];    // empty = all orgs
type OwnerFilter = string[];  // empty = all owners; "__api_key__" = API key entries

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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

export function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

// ---------------------------------------------------------------------------
// Sort button
// ---------------------------------------------------------------------------

function SortButton({
    col, label, sortKey, sortDir, onSort,
}: {
    col: SortKey; label: string; sortKey: SortKey;
    sortDir: SortDir; onSort: (k: SortKey) => void;
}) {
    const active = sortKey === col;
    const Icon = active ? (sortDir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
    return (
        <button
            onClick={() => onSort(col)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
            {label}
            <Icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
        </button>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminQueriesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
            <AdminQueriesPageInner />
        </Suspense>
    );
}

function AdminQueriesPageInner() {
    const searchParams = useSearchParams();

    const [queries, setQueries] = useState<QueryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    // Fan-out: GET /v2/orgs → memberships, then GET /v2/orgs/{org_id}/answers for each
    // Merges all answers across orgs the current admin is a member of
    // TODO: replace with GET /v2/admin/answers when Rob adds it
    useEffect(() => {
        fetch("/api/orgs")
            .then((r) => r.json())
            .then(async (data) => {
                const memberships: MembershipResponse[] = data.memberships ?? [];
                const results = await Promise.allSettled(
                    memberships.map((m) =>
                        fetch(`/api/orgs/${m.org_id}/answers`)
                            .then((r) => r.json())
                            .then((d) => ({ membership: m, answers: d.answers ?? [] }))
                    )
                );
                const merged: QueryRecord[] = [];
                results.forEach((result) => {
                    if (result.status === "fulfilled") {
                        const { membership, answers } = result.value;
                        answers.forEach((a: AnswerListItemResponse) => {
                            merged.push({
                                uuid: a.uuid,
                                question: a.question,
                                price: a.price,
                                paid: a.paid,
                                org_id: membership.org_id,
                                org_name: membership.org_name,
                                owner_kind: a.owner_kind,
                                owner_member_id: a.owner_member_id,
                                owner_api_key_id: a.owner_api_key_id,
                                created_at: a.created_at,
                                paid_at: a.paid_at,
                            });
                        });
                    }
                });
                merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setQueries(merged);
            })
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false));
    }, []);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [orgFilter, setOrgFilter] = useState<OrgFilter>([]);
    const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>([]);
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    // Read ?status= from URL on mount — allows linking with pre-applied filter
    useEffect(() => {
        const s = searchParams.get("status");
        if (s === "pending" || s === "approved") setStatus(s as StatusFilter);
    }, [searchParams]);

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    // Unique org names for org filter
    const orgOptions = useMemo(() => {
        const names = [...new Set(queries.map((q) => q.org_name))].sort();
        return names;
    }, [queries]);

    // Unique member usernames for owner filter
    const ownerOptions = useMemo(() => {
        const names = [...new Set(
            queries
                .filter((q) => q.owner_kind === "member" && q.owner_member_id != null)
                .map((q) => String(q.owner_member_id))
        )].sort();
        return names;
    }, [queries]);

    const filtered = useMemo(() => {
        let list = [...queries];
        if (status === "pending") list = list.filter((q) => !q.paid);
        if (status === "approved") list = list.filter((q) => q.paid);
        if (orgFilter.length > 0) list = list.filter((q) => orgFilter.includes(q.org_name));
        if (ownerFilter.length > 0) {
            list = list.filter((q) => {
                if (ownerFilter.includes("__api_key__") && q.owner_kind === "org_automation") return true;
                if (q.owner_member_id != null && ownerFilter.includes(String(q.owner_member_id))) return true;
                return false;
            });
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.question.toLowerCase().includes(q) ||
                    r.org_name.toLowerCase().includes(q) ||
                    (r.owner_kind === "member" ? `member ${r.owner_member_id}` : "").toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
    }, [queries, search, status, orgFilter, ownerFilter, sortKey, sortDir]);

    const pendingCount = queries.filter((q) => !q.paid).length;
    const approvedCount = queries.filter((q) => q.paid).length;

    // Active filter pills
    const activeFilters = [
        status !== "all" && {
            label: status === "pending" ? "Pending" : "Approved",
            onRemove: () => setStatus("all"),
        },
        ...orgFilter.map((org) => ({
            label: org,
            onRemove: () => setOrgFilter((prev) => prev.filter((o) => o !== org)),
        })),
        ...ownerFilter.map((o) => ({
            label: o === "__api_key__" ? "API key" : o,
            onRemove: () => setOwnerFilter((prev) => prev.filter((x) => x !== o)),
        })),
    ].filter(Boolean) as { label: string; onRemove: () => void }[];

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Queries</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    All queries across every organisation, most recent first.{" "}
                    {pendingCount > 0 && (
                        <span className="text-warning font-medium">
                            {pendingCount} pending approval.
                        </span>
                    )}
                </p>
            </div>

            {/* ── Toolbar ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-9"
                            placeholder="Search question, org, member…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Status */}
                    <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                        <SelectTrigger className="w-36 bg-card text-foreground shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card text-card-foreground">
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                            <SelectItem value="approved">Approved ({approvedCount})</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Org — multi-select dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 h-9 px-3 text-sm bg-card text-foreground border border-input rounded shrink-0 hover:bg-accent transition-colors min-w-[11rem]">
                                <span className="flex-1 text-left truncate">
                                    {orgFilter.length === 0
                                        ? "All orgs"
                                        : orgFilter.length === 1
                                            ? orgFilter[0]
                                            : `${orgFilter.length} orgs`
                                    }
                                </span>
                                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-card text-card-foreground w-56 p-1">
                            <button
                                onClick={() => setOrgFilter([])}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${orgFilter.length === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                    }`}
                            >
                                All orgs
                            </button>
                            {orgOptions.map((org) => (
                                <button
                                    key={org}
                                    onClick={() => setOrgFilter((prev) =>
                                        prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org]
                                    )}
                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors text-left"
                                >
                                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center shrink-0 transition-colors ${orgFilter.includes(org) ? "bg-primary border-primary" : "border-border-3"
                                        }`}>
                                        {orgFilter.includes(org) && (
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="truncate">{org}</span>
                                </button>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Owner — multi-select by username */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 h-9 px-3 text-sm bg-card text-foreground border border-input rounded shrink-0 hover:bg-accent transition-colors min-w-[10rem]">
                                <span className="flex-1 text-left truncate">
                                    {ownerFilter.length === 0
                                        ? "All owners"
                                        : ownerFilter.length === 1
                                            ? (ownerFilter[0] === "__api_key__" ? "API key" : ownerFilter[0])
                                            : `${ownerFilter.length} owners`
                                    }
                                </span>
                                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-card text-card-foreground w-48 p-1">
                            <button
                                onClick={() => setOwnerFilter([])}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${ownerFilter.length === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                    }`}
                            >
                                All owners
                            </button>
                            {ownerOptions.map((username) => (
                                <button
                                    key={username}
                                    onClick={() => setOwnerFilter((prev) =>
                                        prev.includes(username) ? prev.filter((o) => o !== username) : [...prev, username]
                                    )}
                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors text-left"
                                >
                                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center shrink-0 transition-colors ${ownerFilter.includes(username) ? "bg-primary border-primary" : "border-border-3"
                                        }`}>
                                        {ownerFilter.includes(username) && (
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="truncate">{username}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setOwnerFilter((prev) =>
                                    prev.includes("__api_key__") ? prev.filter((o) => o !== "__api_key__") : [...prev, "__api_key__"]
                                )}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors text-left"
                            >
                                <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center shrink-0 transition-colors ${ownerFilter.includes("__api_key__") ? "bg-primary border-primary" : "border-border-3"
                                    }`}>
                                    {ownerFilter.includes("__api_key__") && (
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </span>
                                API key
                            </button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Active filter pills */}
                {activeFilters.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeFilters.map((f) => (
                            <span
                                key={f.label}
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border border-border-3 bg-accent text-foreground font-medium"
                            >
                                {f.label}
                                <button
                                    onClick={f.onRemove}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`Remove ${f.label} filter`}
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                        {activeFilters.length > 1 && (
                            <button
                                onClick={() => { setStatus("all"); setOrgFilter([]); setOwnerFilter([]); }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Mobile: card list ──────────────────────────────────────────────── */}
            <div className="md:hidden flex flex-col gap-3">
                {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No queries match your search.
                    </p>
                )}
                {filtered.map((query) => {
                    const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`;
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
                                    <span className="text-xs text-muted-foreground truncate">{query.org_name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">· {timeAgo(query.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm font-medium tabular-nums">{formatCurrency(query.price)}</span>
                                    {query.paid ? (
                                        <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">Approved</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs font-normal text-warning border-warning/40 bg-warning/5">Pending</Badge>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* ── Desktop: table ─────────────────────────────────────────────────── */}
            <div className="hidden md:block border overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-4 max-w-[360px]">Question</TableHead>
                            <TableHead>
                                <SortButton col="org_name" label="Organisation" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="hidden lg:table-cell text-xs text-muted-foreground font-medium">
                                Owner
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <SortButton col="created_at" label="Submitted" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead>
                                <SortButton col="price" label="Price" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-xs text-muted-foreground font-medium pr-4">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    No queries match your search.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((query) => {
                            const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`;
                            return (
                                <TableRow key={query.uuid} className="group cursor-pointer hover:bg-accent/40">
                                    <TableCell className="pl-4 max-w-[360px] py-3">
                                        <Link href={detailHref} className="block">
                                            <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                                {query.question}
                                            </p>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <Link href={`/admin/organisations/${query.org_id}`} className="hover:text-foreground transition-colors">
                                            {query.org_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {query.owner_kind === "org_automation" ? (
                                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">API key</Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Member #{query.owner_member_id}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                        <Link href={detailHref}>
                                            <span title={formatDate(query.created_at)}>{timeAgo(query.created_at)}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium tabular-nums">
                                        <Link href={detailHref}>{formatCurrency(query.price)}</Link>
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <Link href={detailHref}>
                                            {query.paid ? (
                                                <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">Approved</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs font-normal text-warning border-warning/40 bg-warning/5">Pending</Badge>
                                            )}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <p className="text-xs text-muted-foreground pl-1">
                Showing {filtered.length} of {queries.length} queries
            </p>

        </div>
    );
}