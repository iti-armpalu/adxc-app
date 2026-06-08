"use client";

import { use, useState } from "react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrgDetail = {
    id: number;
    name: string;
    balance: string;
    daily_member_spend_cap: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

type Member = {
    member_id: number;
    user_id: string;
    username: string;
    role: "member" | "org_admin";
    created_at: string;
    updated_at: string;
};

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with GET /v2/admin/orgs/{org_id} (undocumented)
// TODO: replace MOCK_MEMBERS with GET /v2/orgs/{org_id}/members
// ---------------------------------------------------------------------------

const MOCK_ORGS: Record<string, OrgDetail> = {
    "1": { id: 1, name: "Unilever Global Insights", balance: "1240.00", daily_member_spend_cap: "100.00", created_at: "2024-10-14T09:00:00Z", updated_at: "2025-06-03T10:00:00Z", deleted_at: null },
    "2": { id: 2, name: "Nike Consumer Intelligence", balance: "880.50", daily_member_spend_cap: "75.00", created_at: "2024-11-02T11:00:00Z", updated_at: "2025-06-01T09:00:00Z", deleted_at: null },
    "3": { id: 3, name: "L'Oréal Market Research", balance: "42.00", daily_member_spend_cap: "50.00", created_at: "2024-11-20T16:00:00Z", updated_at: "2025-05-30T08:00:00Z", deleted_at: null },
    "4": { id: 4, name: "Procter & Gamble Brand Strategy", balance: "3100.00", daily_member_spend_cap: "250.00", created_at: "2024-12-05T09:00:00Z", updated_at: "2025-06-02T14:00:00Z", deleted_at: null },
    "5": { id: 5, name: "Diageo Audience Labs", balance: "560.00", daily_member_spend_cap: "100.00", created_at: "2025-01-08T10:00:00Z", updated_at: "2025-05-28T11:00:00Z", deleted_at: null },
    "7": { id: 7, name: "Nestlé Strategic Insights", balance: "195.00", daily_member_spend_cap: "50.00", created_at: "2025-02-10T09:00:00Z", updated_at: "2025-05-25T12:00:00Z", deleted_at: null },
    "8": { id: 8, name: "LVMH Brand Intelligence", balance: "4750.00", daily_member_spend_cap: null, created_at: "2025-02-18T11:00:00Z", updated_at: "2025-06-03T09:00:00Z", deleted_at: null },
    "9": { id: 9, name: "Heineken Consumer Insights", balance: "310.00", daily_member_spend_cap: "75.00", created_at: "2025-03-03T10:00:00Z", updated_at: "2025-05-20T14:00:00Z", deleted_at: null },
    "10": { id: 10, name: "Spotify Audience Research", balance: "28.50", daily_member_spend_cap: "25.00", created_at: "2025-03-19T14:00:00Z", updated_at: "2025-05-31T10:00:00Z", deleted_at: null },
};

const MOCK_MEMBERS: Record<string, Member[]> = {
    "1": [
        { member_id: 1, user_id: "usr_01", username: "sarah.chen", role: "org_admin", created_at: "2024-10-14T09:00:00Z", updated_at: "2024-10-14T09:00:00Z" },
        { member_id: 2, user_id: "usr_02", username: "james.whitfield", role: "member", created_at: "2024-11-01T10:00:00Z", updated_at: "2024-11-01T10:00:00Z" },
        { member_id: 3, user_id: "usr_03", username: "priya.nair", role: "member", created_at: "2025-01-15T09:00:00Z", updated_at: "2025-01-15T09:00:00Z" },
    ],
    "2": [
        { member_id: 4, user_id: "usr_04", username: "tom.eriksen", role: "org_admin", created_at: "2024-11-02T11:00:00Z", updated_at: "2024-11-02T11:00:00Z" },
        { member_id: 5, user_id: "usr_05", username: "mei.zhang", role: "member", created_at: "2025-02-10T09:00:00Z", updated_at: "2025-02-10T09:00:00Z" },
    ],
    "8": [
        { member_id: 6, user_id: "usr_06", username: "isabelle.martin", role: "org_admin", created_at: "2025-02-18T11:00:00Z", updated_at: "2025-02-18T11:00:00Z" },
        { member_id: 7, user_id: "usr_07", username: "david.okafor", role: "member", created_at: "2025-03-01T09:00:00Z", updated_at: "2025-03-01T09:00:00Z" },
        { member_id: 8, user_id: "usr_08", username: "anna.lindqvist", role: "member", created_at: "2025-03-10T10:00:00Z", updated_at: "2025-03-10T10:00:00Z" },
        { member_id: 9, user_id: "usr_09", username: "rafael.santos", role: "member", created_at: "2025-04-01T09:00:00Z", updated_at: "2025-04-01T09:00:00Z" },
    ],
};


// ---------------------------------------------------------------------------
// All platform users — for user search in AddMemberDialog
// TODO: replace with GET /v1/users → UserListResponse
// ---------------------------------------------------------------------------

const MOCK_ALL_USERS = [
    { id: "usr_01hx4k2m9n", username: "alice.morgan" },
    { id: "usr_01hx4k3p7q", username: "sarah.chen" },
    { id: "usr_01hx4k9r2s", username: "james.whitfield" },
    { id: "usr_01hx4kbf4t", username: "priya.nair" },
    { id: "usr_01hx4kdf5u", username: "isabelle.martin" },
    { id: "usr_01hx4kgh6v", username: "tom.eriksen" },
    { id: "usr_01hx4kjk7w", username: "mei.zhang" },
    { id: "usr_01hx4kmn8x", username: "david.okafor" },
    { id: "usr_01hx4kpq9y", username: "anna.lindqvist" },
    { id: "usr_01hx4krs0z", username: "rafael.santos" },
];

const TOPUP_SUGGESTIONS = [
    { label: "$50", value: "50" },
    { label: "$100", value: "100" },
    { label: "$250", value: "250" },
    { label: "$500", value: "500" },
    { label: "$1000", value: "1000" },
];

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
// Top Up Dialog
// ---------------------------------------------------------------------------

function TopUpDialog({
    org,
    open,
    onOpenChange,
    onTopUp,
}: {
    org: OrgDetail;
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
        // TODO: POST /v2/orgs/{org_id}/payments/stripe/checkout-session
        // body: TopupRequest { amount: number, currency: "usd" }
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
                        {/* Grouped $ input */}
                        <div className="flex border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                            <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input select-none">
                                USD
                            </span>
                            <input
                                id="topup-amount"
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
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onAdd: (member: Member) => void;
    existingMemberIds: string[];
}) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [selectedUsername, setSelectedUsername] = useState("");
    const [role, setRole] = useState<"member" | "org_admin">("member");
    const [state, setState] = useState<"idle" | "loading" | "success">("idle");

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    // Filter users — exclude already members
    const filteredUsers = MOCK_ALL_USERS.filter(
        (u) =>
            !existingMemberIds.includes(u.id) &&
            u.username.toLowerCase().includes(search.toLowerCase())
    );

    function handleSelect(userId: string, username: string) {
        setSelectedId(userId);
        setSelectedUsername(username);
        setSearch("");
    }

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setSearch("");
            setSelectedId("");
            setSelectedUsername("");
            setRole("member");
            setState("idle");
        }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedId) return;
        setState("loading");
        // TODO: POST /v2/orgs/{org_id}/members
        // body: AddMemberRequest { user_id: string, role: "member" | "org_admin" }
        // returns: OrgMemberResponse
        await new Promise((r) => setTimeout(r, 800));
        onAdd({
            member_id: Math.floor(Math.random() * 1000),
            user_id: selectedId,
            username: selectedUsername,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        setState("success");
        setTimeout(handleClose, 900);
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

                    {/* Selected user */}
                    {selectedId ? (
                        <div className="flex items-center justify-between gap-3 border bg-accent/40 px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <Avatar className="w-6 h-6 shrink-0">
                                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                        {selectedUsername.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{selectedUsername}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedId(""); setSelectedUsername(""); }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Label>User</Label>
                            {/* Search */}
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search by username…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                    className="pl-8 text-sm"
                                />
                            </div>
                            {/* User list */}
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
                                            onClick={() => handleSelect(user.id, user.username)}
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
                                            <span className="text-sm">{user.username}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Role */}
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
                        <Button type="submit" disabled={!selectedId || isLoading || isSuccess} className="gap-2 min-w-[120px]">
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

    // TODO: replace with GET /v2/admin/orgs/{org_id} (undocumented)
    const [org, setOrg] = useState<OrgDetail | undefined>(MOCK_ORGS[id]);

    // TODO: replace with GET /v2/orgs/{org_id}/members
    const [members, setMembers] = useState<Member[]>(
        MOCK_MEMBERS[id] ?? []
    );

    const [topUpOpen, setTopUpOpen] = useState(false);

    function handleTopUpBalance(amount: number) {
        setOrg((prev) =>
            prev ? { ...prev, balance: (parseFloat(prev.balance) + amount).toFixed(2) } : prev
        );
    }
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    async function handleRemove(memberId: number) {
        setRemovingId(memberId);
        // TODO: DELETE /v2/orgs/{org_id}/members/{member_id}
        await new Promise((r) => setTimeout(r, 700));
        setMembers((prev) => prev.filter((m) => m.member_id !== memberId));
        setRemovingId(null);
    }

    async function handleSetRole(memberId: number, role: "member" | "org_admin") {
        setUpdatingId(memberId);
        // TODO: POST /v2/orgs/{org_id}/members/{member_id}/set_role
        // body: SetRoleRequest { role: "member" | "org_admin" }
        await new Promise((r) => setTimeout(r, 600));
        setMembers((prev) =>
            prev.map((m) => m.member_id === memberId ? { ...m, role } : m)
        );
        setUpdatingId(null);
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
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => setAddMemberOpen(true)}
                            >
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
                                    {/* Avatar */}
                                    <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                            {initials(member.username)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Username */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{member.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Added {formatDate(member.created_at)}
                                        </p>
                                    </div>

                                    {/* Role badge */}
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

                                    {/* Updating spinner */}
                                    {updatingId === member.member_id && (
                                        <Loader size={14} className="animate-adxc-spin text-muted-foreground shrink-0" />
                                    )}

                                    {/* Actions */}
                                    {!org.deleted_at && updatingId !== member.member_id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                >
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
                            <Button
                                variant="destructive"
                                size="sm"
                                className="shrink-0"
                                onClick={() => setDeleteOpen(true)}
                            >
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
            />
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>Delete organisation</DialogTitle>
                        <DialogDescription>
                            This will soft-delete{" "}
                            <span className="font-semibold text-foreground">{org.name}</span>.
                            All {members.length} member{members.length !== 1 ? "s" : ""} will
                            lose access immediately.
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
                                // TODO: DELETE /v2/admin/orgs/{org_id} (not in spec — needs backend endpoint)
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