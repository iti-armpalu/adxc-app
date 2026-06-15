"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    MoreHorizontal,
    Trash2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Check,
    Loader,
    AlertCircle,
    CreditCard,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminOrgResponse } from "@/lib/api-types";

type SortKey = "name" | "balance" | "created_at";
type SortDir = "asc" | "desc";


// ---------------------------------------------------------------------------
// Spend cap suggestions
// ---------------------------------------------------------------------------

const SPEND_CAP_SUGGESTIONS = [
    { label: "$10 / day", value: "10" },
    { label: "$25 / day", value: "25" },
    { label: "$50 / day", value: "50" },
    { label: "$100 / day", value: "100" },
    { label: "$250 / day", value: "250" },
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

function initials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

function formatBalance(balance: string) {
    const n = parseFloat(balance);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(n);
}

function balanceColor(balance: string) {
    const n = parseFloat(balance);
    if (n <= 0) return "text-destructive-text";
    if (n < 50) return "text-warning";
    return "text-foreground";
}

// ---------------------------------------------------------------------------
// Sort button
// ---------------------------------------------------------------------------

function SortButton({
    col,
    label,
    sortKey,
    sortDir,
    onSort,
}: {
    col: SortKey;
    label: string;
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (k: SortKey) => void;
}) {
    const active = sortKey === col;
    const Icon = active
        ? sortDir === "asc" ? ChevronUp : ChevronDown
        : ChevronsUpDown;
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
// Create Org Dialog
// ---------------------------------------------------------------------------

function CreateOrgDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated: (org: AdminOrgResponse) => void;
}) {
    const [name, setName] = useState("");
    const [cap, setCap] = useState("");
    const [state, setState] = useState<"idle" | "error" | "loading" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setName("");
            setCap("");
            setState("idle");
            setErrorMsg("");
        }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setState("error");
            setErrorMsg("Organisation name is required.");
            return;
        }
        if (cap && isNaN(parseFloat(cap))) {
            setState("error");
            setErrorMsg("Spend cap must be a valid number.");
            return;
        }
        setState("loading");
        try {
            const res = await fetch("/api/admin/orgs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    daily_member_spend_cap: cap ? parseFloat(cap) : null,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setState("error");
                setErrorMsg(data.error ?? "Failed to create organisation.");
                return;
            }
            const org = await res.json();
            onCreated(org);
            setState("success");
            setTimeout(handleClose, 900);
        } catch {
            setState("error");
            setErrorMsg("Something went wrong.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>New organisation</DialogTitle>
                    <DialogDescription>
                        Create a new org. Members and API keys can be added after creation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
                    {state === "error" && (
                        <Alert variant="destructive" className="py-3">
                            <AlertCircle size={15} />
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="org-name">Name</Label>
                        <Input
                            id="org-name"
                            placeholder="e.g. Ogilvy Group"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setState("idle"); }}
                            disabled={isLoading || isSuccess}
                            autoFocus
                            maxLength={128}
                            className={cn(state === "error" && !name.trim() && "border-destructive")}
                        />
                    </div>

                    {/* Daily member spend cap */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="spend-cap">
                            Daily member spend cap{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-2">
                            {SPEND_CAP_SUGGESTIONS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setCap(s.value)}
                                    disabled={isLoading || isSuccess}
                                    className={cn(
                                        "text-sm px-4 py-2 rounded-full border transition-colors",
                                        cap === s.value
                                            ? "bg-accent border-border-3 text-foreground font-medium"
                                            : "border-border text-muted-foreground hover:text-foreground hover:border-border-3"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        {/* Grouped input */}
                        <div className="flex border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                            <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input select-none">
                                USD
                            </span>
                            <input
                                id="spend-cap"
                                placeholder="No limit"
                                value={cap}
                                onChange={(e) => { setCap(e.target.value); setState("idle"); }}
                                disabled={isLoading || isSuccess}
                                inputMode="decimal"
                                className="flex-1 px-3 py-2 text-sm bg-background text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum each member can spend per day. Leave blank for no limit.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isSuccess} className="gap-2 min-w-[140px]">
                            {isLoading ? (
                                <><Loader size={14} className="animate-adxc-spin" /> Creating…</>
                            ) : isSuccess ? (
                                <><Check size={14} /> Created</>
                            ) : "Create organisation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Delete org dialog
// ---------------------------------------------------------------------------

function DeleteOrgDialog({
    org,
    onOpenChange,
    onDeleted,
}: {
    org: AdminOrgResponse | null;
    onOpenChange: (v: boolean) => void;
    onDeleted: (orgId: string) => void;
}) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!org) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/orgs/${org.id}`, { method: "DELETE" });
            onDeleted(org.id);
        } catch {
            // TODO: show error
        } finally {
            setLoading(false);
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={!!org} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Delete organisation</DialogTitle>
                    <DialogDescription>
                        This will soft-delete{" "}
                        <span className="font-semibold text-foreground">{org?.name}</span>.
                        All members will lose access immediately.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting…" : "Delete organisation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Top up dialog
// ---------------------------------------------------------------------------

const TOPUP_SUGGESTIONS = [
    { label: "$50", value: "50" },
    { label: "$100", value: "100" },
    { label: "$250", value: "250" },
    { label: "$500", value: "500" },
    { label: "$1000", value: "1000" },
];

function TopUpDialog({
    org,
    onOpenChange,
    onTopUp,
}: {
    org: AdminOrgResponse | null;
    onOpenChange: (v: boolean) => void;
    onTopUp: (orgId: string, amount: number) => void;
}) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => setAmount(""), 200);
    }

    async function handleTopUp(e: React.FormEvent) {
        e.preventDefault();
        if (!org || !amount || isNaN(parseFloat(amount))) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/orgs/${org.id}/topup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount), currency: "usd" }),
            });
            onTopUp(org.id, parseFloat(amount));
        } catch {
            // TODO: show error
        } finally {
            setLoading(false);
            handleClose();
        }
    }

    return (
        <Dialog open={!!org} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[380px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Top up balance</DialogTitle>
                    <DialogDescription>
                        Add credit to{" "}
                        <span className="font-semibold text-foreground">{org?.name}</span>.
                        {org && (
                            <span className="block mt-1">
                                Current balance:{" "}
                                <span className={cn("font-semibold", balanceColor(org.balance))}>
                                    {formatBalance(org.balance)}
                                </span>
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleTopUp} noValidate className="flex flex-col gap-4 pt-1">
                    <div className="flex flex-col gap-3">
                        <Label>Amount (USD)</Label>
                        {/* Quick amount pills */}
                        <div className="flex flex-wrap gap-2">
                            {TOPUP_SUGGESTIONS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setAmount(s.value)}
                                    disabled={loading}
                                    className={cn(
                                        "text-sm px-3 py-1.5 rounded-full border transition-colors",
                                        amount === s.value
                                            ? "bg-accent border-border-3 text-foreground font-medium"
                                            : "border-border text-muted-foreground hover:text-foreground hover:border-border-3"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        {/* Grouped input */}
                        <div className="flex border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                            <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input select-none">
                                USD
                            </span>
                            <input
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                                inputMode="decimal"
                                autoFocus
                                className="flex-1 px-3 py-2 text-sm bg-background text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !amount || isNaN(parseFloat(amount))}
                            className="gap-2 min-w-[120px]"
                        >
                            {loading ? (
                                <><Loader size={14} className="animate-adxc-spin" /> Processing…</>
                            ) : "Top up"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminOrganisationsPage() {
    const [orgs, setOrgs] = useState<AdminOrgResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch real orgs on mount — GET /v2/admin/orgs
    useEffect(() => {
        fetch("/api/admin/orgs")
            .then((r) => r.json())
            .then((data) => { if (data.orgs) setOrgs(data.orgs); })
            .catch(() => setOrgs([]))
            .finally(() => setLoading(false));
    }, []);

    const [search, setSearch] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const [createOpen, setCreateOpen] = useState(false);

    function handleTopUpBalance(orgId: string, amount: number) {
        setOrgs((prev) =>
            prev.map((o) =>
                o.id === orgId
                    ? { ...o, balance: (parseFloat(o.balance) + amount).toFixed(2) }
                    : o
            )
        );
    }
    const [deleteTarget, setDeleteTarget] = useState<AdminOrgResponse | null>(null);
    const [topUpTarget, setTopUpTarget] = useState<AdminOrgResponse | null>(null);

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    const filtered = useMemo(() => {
        let list = orgs.filter((o) => showDeleted ? true : !o.deleted_at);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((o) => o.name.toLowerCase().includes(q));
        }
        return [...list].sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
    }, [orgs, search, showDeleted, sortKey, sortDir]);

    const activeCount = orgs.filter((o) => !o.deleted_at).length;
    const deletedCount = orgs.filter((o) => o.deleted_at).length;

    return (
        <>
            <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Organisations</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            <span className="text-foreground font-medium">{activeCount} active</span>
                            {deletedCount > 0 && (
                                <>, <span className="text-muted-foreground">{deletedCount} deleted</span></>
                            )}
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
                        <Plus size={15} strokeWidth={2} />
                        <span className="hidden sm:inline">New organisation</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>

                {/* ── Toolbar ────────────────────────────────────────────────────── */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-9"
                            placeholder="Search organisations…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showDeleted ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowDeleted((v) => !v)}
                        className="shrink-0"
                    >
                        {showDeleted ? "Hide deleted" : "Show deleted"}
                    </Button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2 text-sm">
                        <Loader size={15} className="animate-adxc-spin" />
                        Loading organisations…
                    </div>
                )}

                {/* ── Mobile: card list ──────────────────────────────────────────── */}
                {!loading && (
                    <div className="md:hidden flex flex-col gap-3">
                        {filtered.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No organisations match your search.
                            </p>
                        )}
                        {filtered.map((org) => {
                            const isDeleted = !!org.deleted_at;
                            return (
                                <div key={org.id} className={cn("bg-card border p-4 flex flex-col gap-3", isDeleted && "opacity-50")}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 shrink-0">
                                            <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                {initials(org.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/admin/organisations/${org.id}`}
                                                className="font-medium text-sm hover:text-primary transition-colors"
                                            >
                                                {org.name}
                                            </Link>
                                        </div>
                                        {isDeleted ? (
                                            <Badge variant="destructive" className="text-xs font-normal shrink-0">Deleted</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5 shrink-0">Active</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={cn("font-medium tabular-nums", balanceColor(org.balance))}>
                                            {formatBalance(org.balance)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Cap: {org.daily_member_spend_cap ? formatBalance(org.daily_member_spend_cap) : "No limit"}
                                        </span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                )}

                {/* ── Desktop: table ─────────────────────────────────────────────── */}
                {!loading && (
                    <div className="hidden md:block border overflow-hidden bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-10 pl-4" />
                                    <TableHead>
                                        <SortButton col="name" label="Name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </TableHead>
                                    <TableHead>
                                        <SortButton col="balance" label="Balance" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell text-xs text-muted-foreground font-medium">
                                        Spend cap / day
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        <SortButton col="created_at" label="Created" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </TableHead>
                                    <TableHead className="text-xs text-muted-foreground font-medium">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-10 pr-4" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                            No organisations match your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((org) => {
                                    const isDeleted = !!org.deleted_at;
                                    return (
                                        <TableRow key={org.id} className={cn("group", isDeleted && "opacity-50")}>
                                            <TableCell className="pl-4 pr-2">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                        {initials(org.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/organisations/${org.id}`}
                                                    className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 group/link"
                                                >
                                                    {org.name}
                                                    <ArrowRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn("text-sm font-medium tabular-nums", balanceColor(org.balance))}>
                                                    {formatBalance(org.balance)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                                {org.daily_member_spend_cap
                                                    ? formatBalance(org.daily_member_spend_cap)
                                                    : <span className="text-muted-foreground/50">No limit</span>
                                                }
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                                {formatDate(org.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {isDeleted ? (
                                                    <Badge variant="destructive" className="text-xs font-normal">Deleted</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/organisations/${org.id}`}>
                                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                                View org
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!isDeleted && (
                                                            <DropdownMenuItem onClick={() => setTopUpTarget(org)}>
                                                                <CreditCard className="w-4 h-4 mr-2" />
                                                                Top up balance
                                                            </DropdownMenuItem>
                                                        )}
                                                        {!isDeleted && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => setDeleteTarget(org)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete org
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                )}

                <p className="text-xs text-muted-foreground pl-1">
                    Showing {filtered.length} of {orgs.length} organisations
                </p>

            </div>

            {/* ── Dialogs ──────────────────────────────────────────────────────── */}
            <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(org) => setOrgs((prev) => [org, ...prev])} />
            <DeleteOrgDialog
                org={deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                onDeleted={(id) => setOrgs((prev) => prev.map((o) => String(o.id) === String(id) ? { ...o, deleted_at: new Date().toISOString() } : o))}
            />
            <TopUpDialog
                org={topUpTarget}
                onOpenChange={(v) => !v && setTopUpTarget(null)}
                onTopUp={handleTopUpBalance}
            />
        </>
    );
}