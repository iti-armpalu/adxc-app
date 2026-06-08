"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    X,
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueryRecord = {
    uuid: string;
    question: string;
    abstract: string;
    price: string;
    paid: boolean;
    org_id: number;
    org_name: string;
    owner_kind: "member" | "org_automation";
    owner_username: string | null;
    created_at: string;
    paid_at: string | null;
};

type SortKey = "created_at" | "price" | "org_name";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "pending" | "approved";
type OrgFilter = string[];    // empty = all orgs
type OwnerFilter = string[];  // empty = all owners; "__api_key__" = API key entries

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with platform-wide queries list endpoint (not yet in spec)
// Closest existing: GET /v2/orgs/{org_id}/answers — requires known org_id
// Likely future: GET /v2/admin/queries
// ---------------------------------------------------------------------------

export const MOCK_QUERIES: QueryRecord[] = [
    {
        uuid: "ans_9a1b2c3d",
        question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?",
        abstract: "Analysis of 12,400 YouGov panellists aged 18–26 identifies price-performance ratio, sustainability credentials, and influencer endorsement as the top three purchase drivers, with regional variation between London and Northern England.",
        price: "12.50",
        paid: false,
        org_id: 1,
        org_name: "Unilever Global Insights",
        owner_kind: "member",
        owner_username: "sarah.chen",
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        paid_at: null,
    },
    {
        uuid: "ans_4e5f6g7h",
        question: "How does Reddit sentiment on EV brands compare to X sentiment in Q1 2025?",
        abstract: "Reddit shows 34% higher positive sentiment toward EV brands vs X, driven by r/electricvehicles community engagement. Tesla leads on both platforms; BYD shows strongest growth trajectory on Reddit.",
        price: "8.00",
        paid: false,
        org_id: 2,
        org_name: "Nike Consumer Intelligence",
        owner_kind: "member",
        owner_username: "james.whitfield",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        paid_at: null,
    },
    {
        uuid: "ans_8i9j0k1l",
        question: "What percentage of US households earning over $100k use meal-kit delivery services?",
        abstract: "US Census and consumer panel data indicates 28.4% penetration among households earning $100k+, up from 19.1% in 2022. HelloFresh and Blue Apron hold combined 61% share of this segment.",
        price: "6.50",
        paid: true,
        org_id: 4,
        org_name: "Procter & Gamble Brand Strategy",
        owner_kind: "member",
        owner_username: "priya.nair",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 8 + 1000 * 60 * 5).toISOString(),
    },
    {
        uuid: "ans_2m3n4o5p",
        question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.",
        abstract: "Afterpay leads unaided awareness at 84% among 25–34 year olds. Revolut shows strongest 12-month growth at +18pp. Traditional bank digital offerings lag on spontaneous recall.",
        price: "15.00",
        paid: true,
        org_id: 1,
        org_name: "Unilever Global Insights",
        owner_kind: "org_automation",
        owner_username: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 14 + 1000 * 60 * 7).toISOString(),
    },
    {
        uuid: "ans_3q4r5s6t",
        question: "How has Diageo's Guinness brand perception shifted among women aged 21–35 in the US since 2022?",
        abstract: "Positive brand perception among US women 21–35 has grown from 31% to 49% since 2022, correlating with the 'Belong' campaign. Occasion-based associations have shifted from pub-only to social dining.",
        price: "18.00",
        paid: true,
        org_id: 5,
        org_name: "Diageo Audience Labs",
        owner_kind: "member",
        owner_username: "tom.eriksen",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 8).toISOString(),
    },
    {
        uuid: "ans_7u8v9w0x",
        question: "What are current consumer attitudes toward luxury resale platforms in Western Europe?",
        abstract: "67% of luxury consumers in France, Germany and the UK view authenticated resale positively, up from 44% in 2021. Vestiaire Collective and Vinted lead aided awareness. Environmental motivation has overtaken value-seeking as primary driver.",
        price: "22.00",
        paid: false,
        org_id: 8,
        org_name: "LVMH Brand Intelligence",
        owner_kind: "member",
        owner_username: "isabelle.martin",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        paid_at: null,
    },
    {
        uuid: "ans_1y2z3a4b",
        question: "Spotify vs Apple Music brand loyalty metrics among premium subscribers in the Nordics.",
        abstract: "Spotify retains 78% annual subscriber loyalty in the Nordics vs Apple Music at 61%. Podcast ecosystem cited as primary retention driver for Spotify; Apple Music loyalty correlates strongly with Apple device ownership.",
        price: "9.50",
        paid: true,
        org_id: 10,
        org_name: "Spotify Audience Research",
        owner_kind: "member",
        owner_username: "anna.lindqvist",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 36 + 1000 * 60 * 4).toISOString(),
    },
    {
        uuid: "ans_5c6d7e8f",
        question: "How do L'Oréal and Estée Lauder compare on skincare brand trust among Asian consumers in the UK?",
        abstract: "L'Oréal leads overall skincare trust at 58% vs Estée Lauder at 51% among UK Asian consumers. However, Estée Lauder scores 14pp higher on perceived premium quality and 9pp higher on cultural relevance.",
        price: "14.00",
        paid: true,
        org_id: 3,
        org_name: "L'Oréal Market Research",
        owner_kind: "member",
        owner_username: "mei.zhang",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60 * 7).toISOString(),
    },
    {
        uuid: "ans_9g0h1i2j",
        question: "What is the share of voice for Heineken versus craft beer brands on social media in Germany?",
        abstract: "Heineken holds 22% share of voice in German beer social conversations, trailing craft collective brands at 31% combined. Instagram and TikTok skew strongly toward craft; Heineken leads on X and YouTube.",
        price: "11.00",
        paid: false,
        org_id: 9,
        org_name: "Heineken Consumer Insights",
        owner_kind: "org_automation",
        owner_username: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
        paid_at: null,
    },
    {
        uuid: "ans_3k4l5m6n",
        question: "Consumer willingness to pay premium for sustainable FMCG packaging in the UK.",
        abstract: "42% of UK consumers indicate willingness to pay 10–15% premium for verified sustainable packaging. Willingness drops sharply above 20% premium. Category matters: household cleaning leads at 51%, confectionery trails at 28%.",
        price: "10.00",
        paid: true,
        org_id: 7,
        org_name: "Nestlé Strategic Insights",
        owner_kind: "member",
        owner_username: "david.okafor",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 72 + 1000 * 60 * 6).toISOString(),
    },
];

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
    const searchParams = useSearchParams();
    const [queries] = useState<QueryRecord[]>(MOCK_QUERIES);
    // TODO: replace with platform-wide queries list endpoint

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
                .filter((q) => q.owner_kind === "member" && q.owner_username)
                .map((q) => q.owner_username as string)
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
                if (q.owner_username && ownerFilter.includes(q.owner_username)) return true;
                return false;
            });
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.question.toLowerCase().includes(q) ||
                    r.org_name.toLowerCase().includes(q) ||
                    (r.owner_username ?? "").toLowerCase().includes(q)
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
                    const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner=${encodeURIComponent(query.owner_username ?? "")}&owner_kind=${query.owner_kind}`;
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
                            const detailHref = `/admin/queries/${query.uuid}?org_id=${query.org_id}&org_name=${encodeURIComponent(query.org_name)}&owner=${encodeURIComponent(query.owner_username ?? "")}&owner_kind=${query.owner_kind}`;
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
                                            <span className="text-sm text-muted-foreground">{query.owner_username}</span>
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