"use client";

// app/(app)/admin/organisations/[id]/page.tsx
//
// Org detail page. Sections:
//   1. Header — org name, id, balance, daily cap
//   2. Top up — preset chips + prefixed input
//   3. Members — list, add (searchable), change role, remove
//   4. Danger zone — soft delete with name confirmation
// TODO: wire all actions to real API endpoints

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Plus, Loader, Check,
    AlertCircle, Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "member" | "org_admin";

type Member = {
    memberId: number;   // integer — used for remove + set_role API calls
    userId: string;     // UUID — used for display and add member lookup
    username: string;
    role: Role;
};

type OrgDetail = {
    id: number;
    name: string;
    balance: number;
    dailyMemberSpendCap: number | null;
    members: Member[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/organisations/:id

const ALL_USERS = [
    { id: "c0ba41cc-cfc5-4ca3-ad91-32cacb101224", username: "george" },
    { id: "e9bb5415-7b86-4256-94b9-8ef15bc019aa", username: "iti" },
    { id: "e9c0d812-cb1c-462d-bbbf-2675cff24d56", username: "joseph" },
    { id: "b538a800-fcf8-42aa-ac07-8616ee054916", username: "josh" },
    { id: "32cb77d3-dcb1-4f24-8ad0-aea21870c3c3", username: "marko" },
    { id: "2b6f49d3-f6c9-4ede-9a55-6b4eee591095", username: "rob" },
    { id: "3e01c66f-d812-4e06-8611-7c5290972a34", username: "roy" },
    { id: "bacbc481-02d6-4732-8724-7b331bfd140f", username: "unicron" },
];

const MOCK_ORGS: Record<number, OrgDetail> = {
    1: {
        id: 1, name: "smoke_test", balance: 902, dailyMemberSpendCap: null,
        members: [
            { memberId: 1, userId: "c0ba41cc-cfc5-4ca3-ad91-32cacb101224", username: "george", role: "org_admin" },
            { memberId: 2, userId: "2b6f49d3-f6c9-4ede-9a55-6b4eee591095", username: "rob", role: "member" },
        ],
    },
    2: {
        id: 2, name: "Josh_Test", balance: 100, dailyMemberSpendCap: null,
        members: [{ memberId: 3, userId: "b538a800-fcf8-42aa-ac07-8616ee054916", username: "josh", role: "org_admin" }],
    },
    3: {
        id: 3, name: "unicron test", balance: 10000, dailyMemberSpendCap: null,
        members: [{ memberId: 4, userId: "bacbc481-02d6-4732-8724-7b331bfd140f", username: "unicron", role: "org_admin" }],
    },
    4: { id: 4, name: "george_test", balance: 1000, dailyMemberSpendCap: null, members: [] },
    5: { id: 5, name: "dept_beta", balance: 1000, dailyMemberSpendCap: null, members: [] },
    6: {
        id: 6, name: "iti_test", balance: 275, dailyMemberSpendCap: 100,
        members: [{ memberId: 5, userId: "e9bb5415-7b86-4256-94b9-8ef15bc019aa", username: "iti", role: "org_admin" }],
    },
};

function formatBalance(n: number) {
    return "$" + n.toLocaleString();
}

// ─── Top up presets ───────────────────────────────────────────────────────────

const TOPUP_PRESETS = [25, 50, 100, 250, 500];

// ─── Shared dialog shell ──────────────────────────────────────────────────────
// Consistent header/body/footer structure across all dialogs on this page

function DialogShell({
    title,
    description,
    titleClassName,
    children,
    footer,
}: {
    title: string;
    description: string;
    titleClassName?: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}) {
    return (
        // TODO: replace bg-card override with --dialog token once DS audit done
        <DialogContent className="sm:max-w-[440px] bg-card text-card-foreground gap-0 p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-5 border-b border-border">
                <DialogHeader>
                    <DialogTitle className={cn("text-[17px]", titleClassName)}>{title}</DialogTitle>
                    <DialogDescription className="mt-1">{description}</DialogDescription>
                </DialogHeader>
            </div>
            <div className="px-6 pt-6 pb-4 flex flex-col gap-5">
                {children}
            </div>
            <div className="px-6 py-4 border-t border-border bg-accent/30 flex items-center justify-end gap-2">
                {footer}
            </div>
        </DialogContent>
    );
}

// ─── Add member dialog ────────────────────────────────────────────────────────

function AddMemberDialog({
    open, onOpenChange, existingMemberIds, onAdded,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingMemberIds: string[];
    onAdded: (member: Member) => void;
}) {
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<typeof ALL_USERS[0] | null>(null);
    const [role, setRole] = useState<Role>("member");
    const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");

    const availableUsers = ALL_USERS.filter(
        u => !existingMemberIds.includes(u.id) &&
            u.username.toLowerCase().includes(search.toLowerCase())
    );

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => { setSearch(""); setSelectedUser(null); setRole("member"); setState("idle"); }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedUser) { setState("error"); return; }
        setState("loading");
        try {
            // TODO: POST /admin/organisations/:id/members { user_id: selectedUser.id, role }
            await new Promise(r => setTimeout(r, 700));
            // TODO: real API returns member_id integer — using mock value here
            onAdded({ memberId: Math.floor(Math.random() * 10000), userId: selectedUser.id, username: selectedUser.username, role });
            setState("success");
            setTimeout(handleClose, 900);
        } catch { setState("error"); }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <form onSubmit={handleSubmit} noValidate>
                <DialogShell
                    title="Add member"
                    description="Search for a user and assign their role in this organisation."
                    footer={
                        <>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={state === "loading"}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={state === "loading" || state === "success"} className="gap-2 min-w-[120px]">
                                {state === "loading" ? <><Loader size={14} className="animate-adxc-spin" /> Adding…</>
                                    : state === "success" ? <><Check size={14} /> Added</>
                                        : "Add member"}
                            </Button>
                        </>
                    }
                >
                    {state === "error" && !selectedUser && (
                        <Alert variant="destructive" className="py-3">
                            <AlertCircle size={15} />
                            <AlertDescription>Please select a user to add.</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label>User</Label>
                        <Input
                            placeholder="Search by username…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelectedUser(null); setState("idle"); }}
                            autoFocus autoComplete="off"
                        />
                        {search && !selectedUser && (
                            <div className="rounded-md border border-border bg-background shadow-sm overflow-hidden max-h-[180px] overflow-y-auto">
                                {availableUsers.length === 0 ? (
                                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">No users found</div>
                                ) : availableUsers.map(u => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => { setSelectedUser(u); setSearch(u.username); }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent text-left transition-colors duration-100"
                                    >
                                        <span className="text-sm font-medium text-foreground">{u.username}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">{u.id}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedUser && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent border border-border">
                                <Check size={13} className="text-success shrink-0" />
                                <span className="text-sm font-medium text-foreground">{selectedUser.username}</span>
                                <span className="text-[10px] text-muted-foreground font-mono ml-auto truncate max-w-[160px]">{selectedUser.id}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="org_admin">Org admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </DialogShell>
            </form>
        </Dialog>
    );
}

// ─── Remove member dialog ─────────────────────────────────────────────────────

function RemoveMemberDialog({
    member, open, onOpenChange, onRemoved,
}: {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemoved: (memberId: number) => void;
}) {
    const [state, setState] = useState<"idle" | "loading">("idle");

    async function handleRemove() {
        setState("loading");
        try {
            // TODO: DELETE /v2/orgs/:org_id/members/:member_id
            await new Promise(r => setTimeout(r, 700));
            onRemoved(member!.memberId);
            onOpenChange(false);
        } catch { setState("idle"); }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
            <DialogContent className="sm:max-w-[400px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Remove member</DialogTitle>
                    <DialogDescription>
                        Remove <strong>{member?.username}</strong> from this organisation?
                        They will lose access immediately.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={state === "loading"}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRemove} disabled={state === "loading"} className="gap-2 min-w-[130px]">
                        {state === "loading"
                            ? <><Loader size={14} className="animate-adxc-spin" /> Removing…</>
                            : "Remove member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Soft delete dialog ───────────────────────────────────────────────────────

function SoftDeleteDialog({
    orgName, open, onOpenChange,
}: {
    orgName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [confirm, setConfirm] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "done">("idle");
    const matches = confirm === orgName;

    async function handleDelete() {
        if (!matches) return;
        setState("loading");
        // TODO: POST /admin/organisations/:id/soft-delete
        await new Promise(r => setTimeout(r, 900));
        setState("done");
    }

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => { setConfirm(""); setState("idle"); }, 200);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
            <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground gap-0 p-0 overflow-hidden">
                <div className="px-6 pt-6 pb-5 border-b border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[17px] text-destructive">Soft-delete organisation</DialogTitle>
                        <DialogDescription className="mt-1">
                            Deactivates the org and removes member access. Data is retained
                            and can be restored by your data engineer.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pt-6 pb-4">
                    {state === "done" ? (
                        <div className="flex flex-col items-center gap-3 py-4 text-center animate-adxc-fade">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-success inline-flex items-center justify-center">
                                <Check size={18} />
                            </div>
                            <p className="text-sm font-medium text-foreground">Organisation deactivated</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirm-delete">
                                Type <strong className="font-semibold">{orgName}</strong> to confirm
                            </Label>
                            <Input
                                id="confirm-delete"
                                placeholder={orgName}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                disabled={state === "loading"}
                                autoFocus
                                className={cn(confirm && !matches && "border-destructive focus-visible:ring-ring-error")}
                            />
                        </div>
                    )}
                </div>

                {state !== "done" && (
                    <div className="px-6 py-4 border-t border-border bg-destructive-subtle flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={state === "loading"}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!matches || state === "loading"}
                            className="gap-2 min-w-[160px]"
                        >
                            {state === "loading"
                                ? <><Loader size={14} className="animate-adxc-spin" /> Deleting…</>
                                : "Soft-delete organisation"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("rounded-lg border border-border bg-card p-6 flex flex-col gap-5", className)}>
            {children}
        </div>
    );
}

function SectionHeader({
    title,
    description,
    action,
    titleClassName,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    titleClassName?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
                <h4 className={cn("m-0", titleClassName)}>{title}</h4>
                {description && (
                    <p className="m-0 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgDetailPage() {
    const { id } = useParams();
    const orgId = Number(id);

    // TODO: fetch from GET /admin/organisations/:id
    const initial = MOCK_ORGS[orgId];
    const [org, setOrg] = useState<OrgDetail | null>(initial ?? null);

    const [topUpAmount, setTopUpAmount] = useState("");
    const [topUpPreset, setTopUpPreset] = useState<number | null>(null);
    const [topUpState, setTopUpState] = useState<"idle" | "loading" | "error" | "success">("idle");

    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
    const [softDeleteOpen, setSoftDeleteOpen] = useState(false);

    if (!org) {
        return (
            <div className="p-8 flex flex-col gap-4">
                <Link href="/admin/organisations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={14} /> All organisations
                </Link>
                <p className="text-sm text-muted-foreground">Organisation not found.</p>
            </div>
        );
    }

    async function handleTopUp(e: React.FormEvent) {
        e.preventDefault();
        const amount = Number(topUpAmount);
        if (!topUpAmount || isNaN(amount) || amount <= 0) { setTopUpState("error"); return; }
        setTopUpState("loading");
        try {
            // TODO: POST /v2/orgs/:org_id/payments/stripe/checkout-session
            //       body: TopupRequest { amount, currency: "usd" }
            //       Note: balance is returned as string from OrgBalanceResponse — parseFloat() when wiring up
            await new Promise(r => setTimeout(r, 800));
            setOrg(prev => prev ? { ...prev, balance: prev.balance + amount } : prev);
            setTopUpAmount("");
            setTopUpPreset(null);
            setTopUpState("success");
            setTimeout(() => setTopUpState("idle"), 2000);
        } catch { setTopUpState("error"); }
    }

    function handleTopUpPreset(val: number) {
        setTopUpPreset(val);
        setTopUpAmount(String(val));
        setTopUpState("idle");
    }

    async function handleRoleChange(userId: string, newRole: Role) {
        // TODO: POST /v2/orgs/:org_id/members/:member_id/set_role { role: newRole }
        setOrg(prev => prev
            ? { ...prev, members: prev.members.map(m => m.userId === userId ? { ...m, role: newRole } : m) }
            : prev
        );
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* Back */}
            <Link
                href="/admin/organisations"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft size={14} strokeWidth={2} />
                All organisations
            </Link>

            {/* ── Page header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <h2 className="m-0 text-foreground">{org.name}</h2>
                        <span className="text-xs font-mono text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded">
                            org #{org.id}
                        </span>
                    </div>
                    <p className="m-0 text-sm text-muted-foreground">
                        {org.members.length} {org.members.length === 1 ? "member" : "members"} · Daily cap:{" "}
                        <span className="font-medium text-foreground">
                            {org.dailyMemberSpendCap === null ? "Unlimited"
                                : org.dailyMemberSpendCap === 0 ? "Blocked"
                                    : formatBalance(org.dailyMemberSpendCap)}
                        </span>
                    </p>
                </div>
                <a
                    href={`/ui/orgs/${org.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0 mt-1"
                >
                    Member view
                    <ExternalLink size={11} strokeWidth={2} />
                </a>
            </div>

            {/* ── Top row: balance + top up side by side ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-stretch">

                {/* Current balance stat */}
                <div className="rounded-lg border border-border bg-card p-6 flex flex-col justify-between gap-6">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Current balance
                    </span>
                    <div className="flex flex-col gap-1">
                        <span className="text-[40px] font-bold tracking-[-0.03em] text-foreground leading-none tabular-nums">
                            {formatBalance(org.balance)}
                        </span>
                        <span className="text-xs text-muted-foreground">USD credit</span>
                    </div>
                    {topUpState === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-success animate-adxc-fade">
                            <Check size={12} strokeWidth={2.5} />
                            Balance updated
                        </div>
                    )}
                </div>

                {/* Top up form */}
                <SectionCard>
                    <SectionHeader
                        title="Top up balance"
                        description="Add USD credit to this organisation's account."
                    />
                    <form onSubmit={handleTopUp} noValidate className="flex flex-col gap-3">
                        {/* Preset chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {TOPUP_PRESETS.map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleTopUpPreset(val)}
                                    className={cn(
                                        "h-6 px-2.5 rounded-full text-[11px] font-medium border transition-colors duration-100 cursor-pointer",
                                        topUpPreset === val
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background text-muted-foreground border-border hover:border-border-3 hover:text-foreground"
                                    )}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>

                        {/* Input + button */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-1">
                                <div className={cn(
                                    "flex rounded-md border overflow-hidden transition-shadow",
                                    "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",
                                    topUpState === "error" ? "border-destructive" : "border-border"
                                )}>
                                    <span className="flex items-center justify-center w-10 bg-muted border-r border-border text-sm font-medium text-muted-foreground select-none shrink-0">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        step="0.01"
                                        placeholder="Custom amount"
                                        value={topUpAmount}
                                        onChange={e => { setTopUpAmount(e.target.value); setTopUpPreset(null); setTopUpState("idle"); }}
                                        disabled={topUpState === "loading" || topUpState === "success"}
                                        className="h-10 px-3 bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 w-[160px]"
                                    />
                                </div>
                                {topUpState === "error" && (
                                    <p className="text-xs text-destructive-text">Enter a valid positive amount.</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={topUpState === "loading" || topUpState === "success"}
                                className="gap-2 min-w-[130px]"
                            >
                                {topUpState === "loading" ? (
                                    <><Loader size={14} className="animate-adxc-spin" /> Applying…</>
                                ) : topUpState === "success" ? (
                                    <><Check size={14} /> Applied</>
                                ) : "Apply top up"}
                            </Button>
                        </div>
                    </form>
                </SectionCard>
            </div>

            {/* ── Members ── */}
            <SectionCard>
                <SectionHeader
                    title="Members"
                    description={
                        org.members.length === 0
                            ? "No members yet."
                            : `${org.members.length} ${org.members.length === 1 ? "member" : "members"}`
                    }
                    action={
                        <Button size="sm" variant="outline" onClick={() => setAddMemberOpen(true)} className="gap-1.5 shrink-0">
                            <Plus size={14} strokeWidth={2} />
                            Add member
                        </Button>
                    }
                />

                {org.members.length > 0 && (
                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-[1fr_2fr_160px_44px] gap-4 px-4 py-2.5 bg-accent/50 border-b border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                            <span className="sr-only">Remove</span>
                        </div>
                        <div className="divide-y divide-border">
                            {org.members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="grid grid-cols-[1fr_2fr_160px_44px] gap-4 items-center px-4 py-3 hover:bg-accent/30 transition-colors duration-100"
                                >
                                    <span className="text-sm font-medium text-foreground tracking-[-0.01em]">
                                        {member.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono truncate">
                                        {member.userId}
                                    </span>
                                    <Select
                                        value={member.role}
                                        onValueChange={(v) => handleRoleChange(member.userId, v as Role)}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="org_admin">Org admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive-subtle"
                                        onClick={() => setRemoveTarget(member)}
                                        aria-label={`Remove ${member.username}`}
                                    >
                                        <Trash2 size={14} strokeWidth={1.8} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ── Danger zone ── */}
            <SectionCard className="border-destructive-border bg-destructive-subtle rounded-lg">
                <SectionHeader
                    title="Danger zone"
                    description="Destructive actions that affect all members of this organisation."
                    titleClassName="text-destructive"
                />
                <div className="rounded-lg border border-destructive-border bg-card p-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                            Soft-delete organisation
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Deactivates the org and removes member access. Data is retained.
                        </span>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setSoftDeleteOpen(true)}
                        className="shrink-0"
                    >
                        Soft-delete
                    </Button>
                </div>
            </SectionCard>

            {/* ── Dialogs ── */}
            <AddMemberDialog
                open={addMemberOpen}
                onOpenChange={setAddMemberOpen}
                existingMemberIds={org.members.map(m => m.userId)}
                onAdded={(member) => setOrg(prev => prev ? { ...prev, members: [...prev.members, member] } : prev)}
            />
            <RemoveMemberDialog
                member={removeTarget}
                open={!!removeTarget}
                onOpenChange={(open) => !open && setRemoveTarget(null)}
                onRemoved={(memberId) => {
                    setOrg(prev => prev ? { ...prev, members: prev.members.filter(m => m.memberId !== memberId) } : prev);
                    setRemoveTarget(null);
                }}
            />
            <SoftDeleteDialog
                orgName={org.name}
                open={softDeleteOpen}
                onOpenChange={setSoftDeleteOpen}
            />

        </div>
    );
}