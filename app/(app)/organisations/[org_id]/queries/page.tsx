"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    X,
    ChevronDown as ChevronDownIcon,
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
import type { AnswerListItemResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueryRecord = {
    uuid: string;
    question: string;
    price: string;
    paid: boolean;
    owner_kind: "member" | "org_automation";
    owner_member_id: number | null;
    owner_api_key_id: number | null;
    created_at: string;
    paid_at: string | null;
};

type SortKey = "created_at" | "price";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "pending" | "approved";
type OwnerFilter = string[]; // empty = all; "__api_key__" = API key entries

// (Mock data removed — page fetches from real endpoints based on role)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
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

function formatTokens(value: string) {
    const n = parseFloat(value);
    if (isNaN(n)) return "—";
    return `${new Intl.NumberFormat("en-US").format(n)} tokens`;
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

export default function OrgQueriesPage({
    params: paramsPromise,
}: {
    params: Promise<{ org_id: string }>;
}) {
    const { org_id } = use(paramsPromise);
    const base = `/organisations/${org_id}`;

    const [role, setRole] = useState<"member" | "org_admin">("member");
    const [queries, setQueries] = useState<QueryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch role from GET /v2/orgs/{org_id}/members/me, then fetch answers
    // org_admin → GET /v2/orgs/{org_id}/answers (all org answers)
    // member    → GET /v2/orgs/{org_id}/members/me/answers (own answers only)
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/members/me`)
            .then((r) => r.json())
            .then((me) => {
                const memberRole = me.role ?? "member";
                setRole(memberRole);
                const answersUrl = memberRole === "org_admin"
                    ? `/api/orgs/${org_id}/answers`
                    : `/api/orgs/${org_id}/members/me/answers`;
                return fetch(answersUrl);
            })
            .then((r) => r.json())
            .then((data) => {
                const answers = (data.answers ?? []).map((a: AnswerListItemResponse) => ({
                    uuid: a.uuid,
                    question: a.question,
                    price: a.price,
                    paid: a.paid,
                    owner_kind: a.owner_kind,
                    owner_member_id: a.owner_member_id,
                    owner_api_key_id: a.owner_api_key_id,
                    created_at: a.created_at,
                    paid_at: a.paid_at,
                }));
                setQueries(answers);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [org_id]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>([]);
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    // Owner filter options — by member_id since username not available in AnswerListItemResponse
    // TODO: show username once Rob adds it to the response
    const ownerOptions = useMemo(() => {
        return [...new Set(
            queries
                .filter((q) => q.owner_kind === "member" && q.owner_member_id != null)
                .map((q) => String(q.owner_member_id))
        )].sort();
    }, [queries]);

    const filtered = useMemo(() => {
        let list = [...queries];

        if (status === "pending") list = list.filter((q) => !q.paid);
        if (status === "approved") list = list.filter((q) => q.paid);

        // For members the API already scopes to their own answers
        if (role === "org_admin" && ownerFilter.length > 0) {
            list = list.filter((q) => {
                if (ownerFilter.includes("__api_key__") && q.owner_kind === "org_automation") return true;
                if (q.owner_member_id != null && ownerFilter.includes(String(q.owner_member_id))) return true;
                return false;
            })
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((r) => r.question.toLowerCase().includes(q));
        }

        return list.sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
    }, [queries, search, status, ownerFilter, role, sortKey, sortDir]);

    const pendingCount = queries.filter((q) => !q.paid).length;
    const approvedCount = queries.filter((q) => q.paid).length;

    // Active filter pills
    const activeFilters = [
        status !== "all" && {
            label: status === "pending" ? "Pending" : "Approved",
            onRemove: () => setStatus("all"),
        },
        ...ownerFilter.map((o) => ({
            label: o === "__api_key__" ? "API key" : `Member #${o}`,
            onRemove: () => setOwnerFilter((prev) => prev.filter((x) => x !== o)),
        })),
    ].filter(Boolean) as { label: string; onRemove: () => void }[];

    if (loading) {
        return (
            <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={15} className="animate-adxc-spin" />
                Loading…
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Queries</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {role === "org_admin"
                        ? "All queries across your organisation."
                        : "Your queries and their results."
                    }{" "}
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
                            placeholder="Search queries…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Status */}
                    <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                        <SelectTrigger className="w-40 bg-card text-foreground shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card text-card-foreground">
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                            <SelectItem value="approved">Approved ({approvedCount})</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Owner — org_admin only, multi-select */}
                    {role === "org_admin" && (
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
                                    <ChevronDownIcon size={14} className="text-muted-foreground shrink-0" />
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
                                        {username}
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
                    )}
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
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                        {activeFilters.length > 1 && (
                            <button
                                onClick={() => { setStatus("all"); setOwnerFilter([]); }}
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
                {filtered.map((query) => (
                    <Link
                        key={query.uuid}
                        href={`${base}/queries/${query.uuid}?owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`}
                        className="group bg-card border p-4 flex flex-col gap-2.5 hover:border-border-3 transition-colors"
                    >
                        <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {query.question}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {role === "org_admin" && (
                                    <span className="text-xs text-muted-foreground truncate">
                                        {query.owner_kind === "org_automation" ? "API key" : `Member #${query.owner_member_id}`}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {role === "org_admin" ? "· " : ""}{timeAgo(query.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-medium tabular-nums">{formatTokens(query.price)}</span>
                                {query.paid ? (
                                    <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">Approved</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs font-normal text-warning border-warning/40 bg-warning/5">Pending</Badge>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Desktop: table ─────────────────────────────────────────────────── */}
            <div className="hidden md:block border overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-4 max-w-[400px]">Question</TableHead>
                            {role === "org_admin" && ownerFilter.length === 0 && (
                                <TableHead className="text-xs text-muted-foreground font-medium">Owner</TableHead>
                            )}
                            <TableHead className="hidden lg:table-cell">
                                <SortButton col="created_at" label="Submitted" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead>
                                <SortButton col="price" label="Price" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-xs text-muted-foreground font-medium pr-4">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                                    No queries match your search.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((query) => {
                            const detailHref = `${base}/queries/${query.uuid}?owner_member_id=${query.owner_member_id ?? ""}&owner_kind=${query.owner_kind}`;
                            return (
                                <TableRow key={query.uuid} className="group cursor-pointer hover:bg-accent/40">
                                    <TableCell className="pl-4 max-w-[400px] py-3">
                                        <Link href={detailHref} className="block">
                                            <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                                {query.question}
                                            </p>
                                        </Link>
                                    </TableCell>
                                    {role === "org_admin" && ownerFilter.length === 0 && (
                                        <TableCell>
                                            <Link href={detailHref}>
                                                {query.owner_kind === "org_automation" ? (
                                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">API key</Badge>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Member #{query.owner_member_id}</span>
                                                )}
                                            </Link>
                                        </TableCell>
                                    )}
                                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                        <Link href={detailHref}>
                                            <span title={formatDate(query.created_at)}>{timeAgo(query.created_at)}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium tabular-nums">
                                        <Link href={detailHref}>{formatTokens(query.price)}</Link>
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