"use client";

import { useState } from "react";
import {
    UserPlus,
    Mail,
    Check,
    AlertTriangle,
    MoreHorizontal,
    ShieldCheck,
    User,
    Search,
    X,
    Clock,
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET    /v2/orgs/{org_id}/users              → UserListResponse
// POST   /v2/orgs/{org_id}/users/invite       → InviteResponse
// PUT    /v2/orgs/{org_id}/users/{user_id}    → UserResponse (role change)
// DELETE /v2/orgs/{org_id}/users/{user_id}    → 204
// GET    /v2/orgs/{org_id}/users/invites      → PendingInviteListResponse
// DELETE /v2/orgs/{org_id}/users/invites/{id} → 204 (revoke)

type Role = "admin" | "strategist" | "analyst";

interface OrgUser {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: Role;
    spend_this_month: number;
    queries_this_month: number;
    last_active: string | null;
    joined: string;
    is_you: boolean;
}

interface PendingInvite {
    id: string;
    email: string;
    role: Role;
    invited_at: string;
    invited_by: string;
}

const MOCK_USERS: OrgUser[] = [
    {
        id: "usr_001",
        name: "Maya Chen",
        email: "maya.chen@deptagency.com",
        initials: "MC",
        role: "admin",
        spend_this_month: 54.2,
        queries_this_month: 10,
        last_active: "Today",
        joined: "Mar 2025",
        is_you: true,
    },
    {
        id: "usr_002",
        name: "James Okafor",
        email: "james.okafor@deptagency.com",
        initials: "JO",
        role: "strategist",
        spend_this_month: 38.9,
        queries_this_month: 7,
        last_active: "Today",
        joined: "Mar 2025",
        is_you: false,
    },
    {
        id: "usr_003",
        name: "Priya Nair",
        email: "priya.nair@deptagency.com",
        initials: "PN",
        role: "strategist",
        spend_this_month: 22.1,
        queries_this_month: 4,
        last_active: "Yesterday",
        joined: "Apr 2025",
        is_you: false,
    },
    {
        id: "usr_004",
        name: "Tom Reeves",
        email: "tom.reeves@deptagency.com",
        initials: "TR",
        role: "analyst",
        spend_this_month: 12.3,
        queries_this_month: 2,
        last_active: "3 days ago",
        joined: "Apr 2025",
        is_you: false,
    },
    {
        id: "usr_005",
        name: "Sasha Müller",
        email: "sasha.muller@deptagency.com",
        initials: "SM",
        role: "analyst",
        spend_this_month: 0,
        queries_this_month: 0,
        last_active: null,
        joined: "May 2025",
        is_you: false,
    },
    {
        id: "usr_006",
        name: "Lena Park",
        email: "lena.park@deptagency.com",
        initials: "LP",
        role: "strategist",
        spend_this_month: 0,
        queries_this_month: 0,
        last_active: "3 weeks ago",
        joined: "Jan 2025",
        is_you: false,
    },
    {
        id: "usr_007",
        name: "Rafael Costa",
        email: "rafael.costa@deptagency.com",
        initials: "RC",
        role: "analyst",
        spend_this_month: 0,
        queries_this_month: 0,
        last_active: null,
        joined: "May 2025",
        is_you: false,
    },
];

const MOCK_PENDING_INVITES: PendingInvite[] = [
    {
        id: "inv_001",
        email: "nina.walsh@deptagency.com",
        role: "strategist",
        invited_at: "26 May 2026",
        invited_by: "Maya Chen",
    },
    {
        id: "inv_002",
        email: "dan.fox@deptagency.com",
        role: "analyst",
        invited_at: "24 May 2026",
        invited_by: "Maya Chen",
    },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; description: string; color: string }> = {
    admin: {
        label: "Admin",
        description: "Full access — billing, users, org settings, API keys.",
        color: "bg-brand-100 text-brand-700",
    },
    strategist: {
        label: "Strategist",
        description: "Can run and approve queries. Cannot access billing or org settings.",
        color: "bg-blue-100 text-blue-700",
    },
    analyst: {
        label: "Analyst",
        description: "Can view results. Cannot run or approve queries.",
        color: "bg-neutral-100 text-neutral-700",
    },
};

function RoleBadge({ role }: { role: Role }) {
    const meta = ROLE_META[role];
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}
        >
            {role === "admin" ? (
                <ShieldCheck size={11} aria-hidden="true" />
            ) : (
                <User size={11} aria-hidden="true" />
            )}
            {meta.label}
        </span>
    );
}

function Avatar({
    initials,
    inactive,
}: {
    initials: string;
    inactive?: boolean;
}) {
    return (
        <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${inactive
                    ? "bg-neutral-100 text-neutral-400"
                    : "bg-brand-100 text-brand-700"
                }`}
        >
            {initials}
        </div>
    );
}

// ─── Invite dialog ────────────────────────────────────────────────────────────

function InviteDialog({
    open,
    onOpenChange,
    onInvited,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onInvited: (email: string, role: Role) => void;
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<Role>("strategist");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    function handleInvite() {
        if (!isValidEmail) {
            setError("Enter a valid email address.");
            return;
        }
        setSending(true);
        setError("");
        // TODO: POST /v2/orgs/{org_id}/users/invite { email, role }
        setTimeout(() => {
            setSending(false);
            onInvited(email, role);
            setEmail("");
            setRole("strategist");
            onOpenChange(false);
        }, 900);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite team member</DialogTitle>
                    <DialogDescription>
                        They'll receive an email with a link to join DEPT on ADXC.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="invite-email" className="text-xs font-medium">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@deptagency.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                className={`pl-8 ${error ? "border-destructive" : ""}`}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle size={11} />
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="invite-role" className="text-xs font-medium">
                            Role
                        </Label>
                        <Select
                            value={role}
                            onValueChange={(v) => setRole(v as Role)}
                        >
                            <SelectTrigger id="invite-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(ROLE_META) as Role[]).map((r) => (
                                    <SelectItem key={r} value={r}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium">
                                                {ROLE_META[r].label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {ROLE_META[r].description}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={sending}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!isValidEmail || sending}
                        onClick={handleInvite}
                        className="gap-1.5"
                    >
                        <Mail size={13} />
                        {sending ? "Sending…" : "Send invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Remove confirm dialog ────────────────────────────────────────────────────

function RemoveDialog({
    user,
    onOpenChange,
    onRemoved,
}: {
    user: OrgUser | null;
    onOpenChange: (v: boolean) => void;
    onRemoved: (id: string) => void;
}) {
    if (!user) return null;

    return (
        <Dialog open={!!user} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove {user.name}?</DialogTitle>
                    <DialogDescription>
                        They'll lose access to DEPT's ADXC account immediately. Their
                        query history and spend records will be retained. This can be
                        undone by inviting them again.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {/* TODO: DELETE /v2/orgs/{org_id}/users/{user.id} */}
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onRemoved(user.id);
                            onOpenChange(false);
                        }}
                    >
                        Remove {user.name.split(" ")[0]}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({
    user,
    onRoleChange,
    onRemove,
}: {
    user: OrgUser;
    onRoleChange: (id: string, role: Role) => void;
    onRemove: (user: OrgUser) => void;
}) {
    const isInactive = !user.last_active || user.spend_this_month === 0;

    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 py-3.5 border-b border-border last:border-0">

            {/* Avatar */}
            <Avatar initials={user.initials} inactive={isInactive} />

            {/* Name + email */}
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                    </p>
                    {user.is_you && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                    {!user.last_active && (
                        <Badge
                            variant="secondary"
                            className="text-xs h-4 px-1.5 font-normal text-muted-foreground"
                        >
                            Never logged in
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                </p>
            </div>

            {/* Activity */}
            <div className="text-right hidden md:block">
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {user.last_active ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {user.queries_this_month > 0
                        ? `${user.queries_this_month} queries · $${user.spend_this_month.toFixed(2)}`
                        : "No activity this month"}
                </p>
            </div>

            {/* Role badge */}
            <div className="hidden md:block">
                <RoleBadge role={user.role} />
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        aria-label={`Actions for ${user.name}`}
                    >
                        <MoreHorizontal size={15} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                        <p className="text-xs text-muted-foreground font-medium mb-1.5">
                            Change role
                        </p>
                        {(Object.keys(ROLE_META) as Role[]).map((r) => (
                            <DropdownMenuItem
                                key={r}
                                className="flex items-center justify-between text-sm"
                                onClick={() => onRoleChange(user.id, r)}
                                disabled={user.is_you && r !== "admin"}
                            >
                                {ROLE_META[r].label}
                                {user.role === r && (
                                    <Check size={13} className="text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                    {!user.is_you && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive text-sm"
                                onClick={() => onRemove(user)}
                            >
                                Remove from org
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// ─── Pending invite row ───────────────────────────────────────────────────────

function PendingInviteRow({
    invite,
    onRevoke,
}: {
    invite: PendingInvite;
    onRevoke: (id: string) => void;
}) {
    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 py-3.5 border-b border-border last:border-0">

            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
                <Mail size={12} className="text-muted-foreground" />
            </div>

            {/* Email */}
            <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{invite.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Invited {invite.invited_at} by {invite.invited_by}
                </p>
            </div>

            {/* Pending badge */}
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} />
                Pending
            </div>

            {/* Role */}
            <div className="hidden md:block">
                <RoleBadge role={invite.role} />
            </div>

            {/* Revoke */}
            <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                aria-label={`Revoke invite for ${invite.email}`}
                onClick={() => onRevoke(invite.id)}
            // TODO: DELETE /v2/orgs/{org_id}/users/invites/{invite.id}
            >
                <X size={14} />
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const [users, setUsers] = useState<OrgUser[]>(MOCK_USERS);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(
        MOCK_PENDING_INVITES
    );
    const [inviteOpen, setInviteOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<OrgUser | null>(null);
    const [search, setSearch] = useState("");

    const activeThisMonth = users.filter((u) => u.queries_this_month > 0).length;
    const neverLoggedIn = users.filter((u) => !u.last_active).length;

    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    function handleRoleChange(id: string, role: Role) {
        // TODO: PUT /v2/orgs/{org_id}/users/{id} { role }
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, role } : u))
        );
    }

    function handleRemove(id: string) {
        // TODO: DELETE /v2/orgs/{org_id}/users/{id}
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }

    function handleInvited(email: string, role: Role) {
        // Optimistically add to pending list
        // TODO: POST /v2/orgs/{org_id}/users/invite → refresh pending list
        setPendingInvites((prev) => [
            {
                id: `inv_${Date.now()}`,
                email,
                role,
                invited_at: "Just now",
                invited_by: "Maya Chen",
            },
            ...prev,
        ]);
    }

    function handleRevoke(id: string) {
        // TODO: DELETE /v2/orgs/{org_id}/users/invites/{id}
        setPendingInvites((prev) => prev.filter((i) => i.id !== id));
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">
                        DEPT
                    </p>
                    <h2>Users</h2>
                </div>
                <Button
                    className="shrink-0 gap-1.5"
                    onClick={() => setInviteOpen(true)}
                >
                    <UserPlus size={15} />
                    Invite member
                </Button>
            </div>

            {/* ── Summary stats ── */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Members
                        </p>
                        <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                            {users.length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingInvites.length} invite
                            {pendingInvites.length !== 1 ? "s" : ""} pending
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Active this month
                        </p>
                        <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                            {activeThisMonth}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            ran at least one query
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Never logged in
                        </p>
                        <p
                            className={`text-xl font-bold tracking-[-0.02em] ${neverLoggedIn > 0
                                    ? "text-orange-600"
                                    : "text-foreground"
                                }`}
                        >
                            {neverLoggedIn}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {neverLoggedIn > 0
                                ? "consider re-inviting or removing"
                                : "all members active"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Role legend ── */}
            <Card className="bg-muted/30 border-border/60">
                <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(Object.keys(ROLE_META) as Role[]).map((r) => (
                            <div key={r} className="flex items-start gap-2">
                                <RoleBadge role={r} />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {ROLE_META[r].description}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── User list ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Members
                    </p>
                    {/* Search */}
                    <div className="relative w-56">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search members…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                        {search && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* TODO: wire up GET /v2/orgs/{org_id}/users */}
                <Card>
                    <CardContent className="pt-0 pb-0 px-5">
                        {filtered.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                No members match "{search}".
                            </p>
                        ) : (
                            filtered.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onRoleChange={handleRoleChange}
                                    onRemove={(u) => setRemoveTarget(u)}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Pending invites ── */}
            {pendingInvites.length > 0 && (
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Pending invites
                    </p>
                    {/* TODO: wire up GET /v2/orgs/{org_id}/users/invites */}
                    <Card>
                        <CardContent className="pt-0 pb-0 px-5">
                            {pendingInvites.map((invite) => (
                                <PendingInviteRow
                                    key={invite.id}
                                    invite={invite}
                                    onRevoke={handleRevoke}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Dialogs ── */}
            <InviteDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                onInvited={handleInvited}
            />
            <RemoveDialog
                user={removeTarget}
                onOpenChange={(v) => !v && setRemoveTarget(null)}
                onRemoved={handleRemove}
            />

        </div>
    );
}