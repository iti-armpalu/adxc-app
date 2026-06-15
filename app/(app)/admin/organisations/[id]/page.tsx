"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Loader,
    Check,
    MoreHorizontal,
    Search,
    Trash2,
    ShieldCheck,
    ShieldMinus,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
    AdminOrgResponse,
    OrgMemberResponse,
    AdminUserResponse,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

function balanceColor(balance: string) {
    const n = parseFloat(balance);
    if (n <= 0) return "text-destructive-text";
    if (n < 50) return "text-warning";
    return "text-foreground";
}

function initials(username: string) {
    return username.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOPUP_SUGGESTIONS = [
    { label: "$50", value: "50" },
    { label: "$100", value: "100" },
    { label: "$250", value: "250" },
    { label: "$500", value: "500" },
    { label: "$1000", value: "1000" },
];

// ---------------------------------------------------------------------------
// Top Up Dialog
// ---------------------------------------------------------------------------

function TopUpDialog({
    org,
    open,
    onOpenChange,
    onTopUp,
}: {
    org: AdminOrgResponse;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onTopUp: (amount: number) => void;
}) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => setAmount(""), 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount || isNaN(parseFloat(amount))) return;
        setLoading(true);
        // TODO: POST /v2/orgs/{org_id}/payments/stripe/checkout-session (stub)
        // No direct admin top-up endpoint in spec yet — optimistic UI update only
        await new Promise((r) => setTimeout(r, 800));
        onTopUp(parseFloat(amount));
        setLoading(false);
        handleClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[380px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Top up balance</DialogTitle>
                    <DialogDescription>
                        Add credit to <span className="font-semibold text-foreground">{org.name}</span>.
                        <span className="block mt-1">
                            Current balance:{" "}
                            <span className={cn("font-semibold", balanceColor(org.balance))}>
                                {formatCurrency(org.balance)}
                            </span>
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
                    <div className="flex flex-col gap-3">
                        <Label>Amount (USD)</Label>
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
                            className="gap-2 min-w-[110px]"
                        >
                            {loading
                                ? <><Loader size={14} className="animate-adxc-spin" /> Processing…</>
                                : "Top up"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Add Member Dialog
// ---------------------------------------------------------------------------

function AddMemberDialog({
    open,
    onOpenChange,
    onAdd,
    existingMemberIds,
    orgId,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onAdd: (member: OrgMemberResponse) => void;
    existingMemberIds: string[];
    orgId: string;
}) {
    const [search, setSearch] = useState("");
    const [selectedEmail, setSelectedEmail] = useState("");
    const [selectedUsername, setSelectedUsername] = useState("");
    const [role, setRole] = useState<"member" | "org_admin">("member");
    const [state, setState] = useState<"idle" | "loading" | "success">("idle");
    const [allUsers, setAllUsers] = useState<AdminUserResponse[]>([]);

    // Fetch real users when dialog opens
    // GET /v1/users → UserListResponse
    useEffect(() => {
        if (open) {
            fetch("/api/users")
                .then((r) => r.json())
                .then((data) => { if (data.users) setAllUsers(data.users); });
        }
    }, [open]);

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    // Filter out already-members, match search against email or username
    const filteredUsers = allUsers.filter(
        (u) =>
            !existingMemberIds.includes(u.id) &&
            (
                (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (u.username ?? "").toLowerCase().includes(search.toLowerCase())
            )
    );

    function handleSelect(email: string, username: string) {
        setSelectedEmail(email);
        setSelectedUsername(username);
        setSearch("");
    }

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setSearch("");
            setSelectedEmail("");
            setSelectedUsername("");
            setRole("member");
            setState("idle");
        }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEmail) return;
        setState("loading");
        try {
            // POST /v2/orgs/{org_id}/members — AddMemberRequest { email, role }
            const res = await fetch(`/api/orgs/${orgId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: selectedEmail, role }),
            });
            if (!res.ok) throw new Error("Failed");
            const member = await res.json();
            onAdd(member);
            setState("success");
            setTimeout(handleClose, 900);
        } catch {
            setState("idle");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Add member</DialogTitle>
                    <DialogDescription>
                        Select a platform user to add to this organisation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
                    {selectedEmail ? (
                        <div className="flex items-center justify-between gap-3 border bg-accent/40 px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <Avatar className="w-6 h-6 shrink-0">
                                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                        {selectedUsername.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium leading-tight">{selectedUsername}</span>
                                    <span className="text-xs text-muted-foreground truncate">{selectedEmail || "—"}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedEmail(""); setSelectedUsername(""); }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Label>User</Label>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search by email or username…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                    className="pl-8 text-sm"
                                />
                            </div>
                            <div className="border overflow-hidden max-h-[200px] overflow-y-auto">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-6">
                                        {search ? "No users match your search." : "All users are already members."}
                                    </p>
                                ) : (
                                    filteredUsers.map((user, i) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleSelect(user.email ?? "", user.username)}
                                            className={cn(
                                                "flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors",
                                                i < filteredUsers.length - 1 && "border-b border-border"
                                            )}
                                        >
                                            <Avatar className="w-6 h-6 shrink-0">
                                                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm leading-tight">{user.username}</span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email ?? "—"}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label>Role</Label>
                        <Select
                            value={role}
                            onValueChange={(v) => setRole(v as "member" | "org_admin")}
                            disabled={isLoading || isSuccess}
                        >
                            <SelectTrigger className="w-full bg-background text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card text-card-foreground">
                                <SelectItem value="member">Member — can query and view own answers</SelectItem>
                                <SelectItem value="org_admin">Org admin — can manage members and API keys</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedEmail || isLoading || isSuccess} className="gap-2 min-w-[120px]">
                            {isLoading ? "Adding…" : isSuccess ? "Added" : "Add member"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgDetailPage({
    params: paramsPromise,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(paramsPromise);

    const [org, setOrg] = useState<AdminOrgResponse | undefined>(undefined);
    const [members, setMembers] = useState<OrgMemberResponse[]>([]);
    const [loadingOrg, setLoadingOrg] = useState(true);

    const [topUpOpen, setTopUpOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch org — GET /v2/admin/orgs/{id}
    useEffect(() => {
        fetch(`/api/admin/orgs/${id}`)
            .then((r) => r.json())
            .then((data) => setOrg(data))
            .catch(() => setOrg(undefined))
            .finally(() => setLoadingOrg(false));
    }, [id]);

    // Fetch members — GET /v2/orgs/{org_id}/members
    useEffect(() => {
        fetch(`/api/orgs/${id}/members`)
            .then((r) => r.json())
            .then((data) => { if (data.members) setMembers(data.members); })
            .catch(() => setMembers([]));
    }, [id]);

    function handleTopUpBalance(amount: number) {
        setOrg((prev) =>
            prev ? { ...prev, balance: (parseFloat(prev.balance) + amount).toFixed(2) } : prev
        );
    }

    async function handleRemove(memberId: number) {
        setRemovingId(memberId);
        try {
            await fetch(`/api/orgs/${id}/members/${memberId}`, { method: "DELETE" });
            setMembers((prev) => prev.filter((m) => m.member_id !== memberId));
        } catch {
            // TODO: show error
        } finally {
            setRemovingId(null);
        }
    }

    async function handleSetRole(memberId: number, role: "member" | "org_admin") {
        setUpdatingId(memberId);
        try {
            await fetch(`/api/orgs/${id}/members/${memberId}/set-role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            setMembers((prev) =>
                prev.map((m) => m.member_id === memberId ? { ...m, role } : m)
            );
        } catch {
            // TODO: show error
        } finally {
            setUpdatingId(null);
        }
    }

    if (loadingOrg) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={15} className="animate-adxc-spin" />
                Loading…
            </div>
        );
    }

    if (!org) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto">
                <Link
                    href="/admin/organisations"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-6"
                >
                    <ArrowLeft size={14} />
                    All organisations
                </Link>
                <p className="text-sm text-muted-foreground">Organisation not found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* ── Back ───────────────────────────────────────────────────────── */}
                <Link
                    href="/admin/organisations"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft size={14} />
                    All organisations
                </Link>

                {/* ── Org header ─────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
                            {org.deleted_at ? (
                                <Badge variant="destructive" className="text-xs font-normal">Deleted</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">
                                    Active
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created {formatDate(org.created_at)}
                        </p>
                    </div>
                    {!org.deleted_at && (
                        <Button onClick={() => setTopUpOpen(true)} variant="outline" className="gap-2 shrink-0 self-start sm:self-auto">
                            <CreditCard size={15} />
                            Top up balance
                        </Button>
                    )}
                </div>

                {/* ── Stats ──────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-card border p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <span className={cn("text-2xl font-semibold tabular-nums", balanceColor(org.balance))}>
                            {formatCurrency(org.balance)}
                        </span>
                    </div>
                    <div className="bg-card border p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Daily spend cap / member</span>
                        <span className="text-2xl font-semibold">
                            {org.daily_member_spend_cap
                                ? formatCurrency(org.daily_member_spend_cap)
                                : <span className="text-muted-foreground text-lg">No limit</span>
                            }
                        </span>
                    </div>
                    <div className="bg-card border p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Members</span>
                        <span className="text-2xl font-semibold">{members.length}</span>
                    </div>
                </div>

                {/* ── Members ────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Members</h2>
                        {!org.deleted_at && (
                            <Button size="sm" className="gap-2" onClick={() => setAddMemberOpen(true)}>
                                <Plus size={14} strokeWidth={2} />
                                Add member
                            </Button>
                        )}
                    </div>

                    <div className="border overflow-hidden bg-card">
                        {members.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center gap-2">
                                <p className="text-sm text-muted-foreground">No members yet.</p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Add yourself as an org admin to access this organisation's member pages — queries, settings and API keys.
                                </p>
                            </div>
                        ) : (
                            members.map((member, i) => (
                                <div
                                    key={member.member_id}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 group",
                                        i < members.length - 1 && "border-b border-border"
                                    )}
                                >
                                    <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                            {initials(member.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{member.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Added {formatDate(member.created_at)}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs font-normal shrink-0",
                                            member.role === "org_admin"
                                                ? "text-primary border-primary/30 bg-primary/5"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {member.role === "org_admin" ? "Org admin" : "Member"}
                                    </Badge>
                                    {updatingId === member.member_id && (
                                        <Loader size={14} className="animate-adxc-spin text-muted-foreground shrink-0" />
                                    )}
                                    {!org.deleted_at && updatingId !== member.member_id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <MoreHorizontal size={15} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 bg-card text-card-foreground">
                                                {member.role === "member" ? (
                                                    <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "org_admin")}>
                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                        Make org admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "member")}>
                                                        <ShieldMinus className="w-4 h-4 mr-2" />
                                                        Remove admin role
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleRemove(member.member_id)}
                                                    disabled={removingId === member.member_id}
                                                >
                                                    {removingId === member.member_id ? (
                                                        <><Loader size={14} className="mr-2 animate-adxc-spin" /> Removing…</>
                                                    ) : (
                                                        <><Trash2 className="w-4 h-4 mr-2" /> Remove from org</>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Danger zone ────────────────────────────────────────────────── */}
                {!org.deleted_at && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-semibold text-destructive-text">Danger zone</h2>
                        <div className="border border-destructive/30 p-4 flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium">Delete organisation</p>
                                <p className="text-xs text-muted-foreground">
                                    Soft-deletes the org. All members lose access immediately. Can be reversed by a platform engineer.
                                </p>
                            </div>
                            <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setDeleteOpen(true)}>
                                Delete org
                            </Button>
                        </div>
                    </div>
                )}

            </div>

            {/* ── Dialogs ────────────────────────────────────────────────────────── */}
            <TopUpDialog
                org={org}
                open={topUpOpen}
                onOpenChange={setTopUpOpen}
                onTopUp={handleTopUpBalance}
            />
            <AddMemberDialog
                open={addMemberOpen}
                onOpenChange={setAddMemberOpen}
                onAdd={(member) => setMembers((prev) => [...prev, member])}
                existingMemberIds={members.map((m) => m.user_id)}
                orgId={id}
            />
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>Delete organisation</DialogTitle>
                        <DialogDescription>
                            This will soft-delete{" "}
                            <span className="font-semibold text-foreground">{org.name}</span>.
                            All {members.length} member{members.length !== 1 ? "s" : ""} will lose access immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            className="gap-2"
                            onClick={async () => {
                                setDeleting(true);
                                // TODO: DELETE /v2/admin/orgs/{org_id} — not in spec yet
                                await new Promise((r) => setTimeout(r, 800));
                                setDeleting(false);
                                setDeleteOpen(false);
                            }}
                        >
                            {deleting
                                ? <><Loader size={14} className="animate-adxc-spin" /> Deleting…</>
                                : "Delete organisation"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}