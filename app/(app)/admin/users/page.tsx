"use client";

import { useState, useMemo } from "react";
import {
    Search,
    MoreHorizontal,
    Plus,
    Trash2,
    KeyRound,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Copy,
    Check,
    Eye,
    EyeOff,
    AlertCircle,
    Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type User = {
    id: string;
    username: string;
    created_at: string;
    deleted_at: string | null;
};

type SortKey = "username" | "created_at";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with GET /v1/users (admin-only)
// ---------------------------------------------------------------------------

const MOCK_USERS: User[] = [
    {
        id: "usr_01hx4k2m9n",
        username: "alice.morgan",
        created_at: "2024-11-03T09:14:22Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4k3p7q",
        username: "brand.team.ogilvy",
        created_at: "2024-11-15T11:45:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4k9r2s",
        username: "data.provider.yougov",
        created_at: "2024-12-01T16:00:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4kbf4t",
        username: "james.whitfield",
        created_at: "2025-01-08T08:22:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4kdf5u",
        username: "agency.planner.bbdo",
        created_at: "2025-01-20T13:00:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4kgh6v",
        username: "sdk.integrator.01",
        created_at: "2025-02-03T07:00:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4kjk7w",
        username: "nadia.vasquez",
        created_at: "2025-02-14T10:45:00Z",
        deleted_at: "2025-05-15T11:00:00Z",
    },
    {
        id: "usr_01hx4kmn8x",
        username: "provider.reddit.api",
        created_at: "2025-03-01T09:00:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4kpq9y",
        username: "tom.eriksen",
        created_at: "2025-03-18T15:30:00Z",
        deleted_at: null,
    },
    {
        id: "usr_01hx4krs0z",
        username: "census.feed.svc",
        created_at: "2025-04-05T12:00:00Z",
        deleted_at: null,
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

function initials(username: string) {
    return username.slice(0, 2).toUpperCase();
}



// ---------------------------------------------------------------------------
// Sub-components
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
    const Icon = active ? (sortDir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
    return (
        <button
            onClick={() => onSort(col)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
            {label}
            <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : ""}`} />
        </button>
    );
}

function CopyId({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(id);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            title="Copy ID"
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Password input with show/hide toggle
// ---------------------------------------------------------------------------

function PasswordInput({
    id,
    value,
    onChange,
    disabled,
    hasError,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    hasError?: boolean;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                autoComplete="new-password"
                className={cn("pr-10", hasError && "border-destructive")}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                tabIndex={-1}
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Create User Dialog
// ---------------------------------------------------------------------------

function CreateUserDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState<"idle" | "error" | "loading" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setUsername("");
            setPassword("");
            setState("idle");
            setErrorMsg("");
        }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim() || password.length < 8) {
            setState("error");
            setErrorMsg("Please fill in all fields correctly.");
            return;
        }
        setState("loading");
        // TODO: POST /v2/admin/users  body: { username, password }
        await new Promise((r) => setTimeout(r, 800));
        setState("success");
        setTimeout(handleClose, 900);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>New user</DialogTitle>
                    <DialogDescription>
                        Create a platform account. The user can change their password after signing in.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
                    {state === "error" && (
                        <Alert variant="destructive" className="py-3">
                            <AlertCircle size={15} />
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="create-username">Username</Label>
                        <Input
                            id="create-username"
                            placeholder="e.g. jane"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setState("idle"); }}
                            disabled={isLoading || isSuccess}
                            autoComplete="off"
                            autoFocus
                            maxLength={64}
                            className={cn(state === "error" && !username.trim() && "border-destructive")}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="create-password">
                            Password{" "}
                            <span className="text-muted-foreground font-normal">(min 8)</span>
                        </Label>
                        <PasswordInput
                            id="create-password"
                            value={password}
                            onChange={(v) => { setPassword(v); setState("idle"); }}
                            disabled={isLoading || isSuccess}
                            hasError={state === "error" && password.length < 8}
                        />
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isSuccess} className="gap-2 min-w-[120px]">
                            {isLoading ? (
                                <><Loader size={14} className="animate-adxc-spin" /> Creating…</>
                            ) : isSuccess ? (
                                <><Check size={14} /> Created</>
                            ) : "Create user"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------

function DeleteUserDialog({
    user,
    onOpenChange,
}: {
    user: User | null;
    onOpenChange: (v: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!user) return;
        setLoading(true);
        // TODO: DELETE /v2/admin/users/{user_id}  (endpoint not yet in spec — placeholder)
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        onOpenChange(false);
    }

    return (
        <Dialog open={!!user} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete user</DialogTitle>
                    <DialogDescription>
                        This will soft-delete{" "}
                        <span className="font-semibold text-foreground">{user?.username}</span>. They will
                        lose access immediately. This action can be reversed by a platform engineer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting…" : "Delete user"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Reset password dialog
// ---------------------------------------------------------------------------

function ResetPasswordDialog({
    user,
    onOpenChange,
}: {
    user: User | null;
    onOpenChange: (v: boolean) => void;
}) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleReset() {
        if (!user || password.length < 8) return;
        setLoading(true);
        // TODO: POST /v2/admin/users/{user_id}/set_password  body: { password }
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        onOpenChange(false);
        setPassword("");
    }

    return (
        <Dialog open={!!user} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reset password</DialogTitle>
                    <DialogDescription>
                        Set a new password for{" "}
                        <span className="font-semibold text-foreground">{user?.username}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleReset} disabled={password.length < 8 || loading}>
                        {loading ? "Saving…" : "Set password"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
    const [users] = useState<User[]>(MOCK_USERS);
    // TODO: replace useState initialiser with: await fetch('/v1/users', { headers: { Authorization } })

    const [search, setSearch] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [resetTarget, setResetTarget] = useState<User | null>(null);

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    const filtered = useMemo(() => {
        let list = users.filter((u) => (showDeleted ? true : !u.deleted_at));
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (u) => u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
            );
        }
        list = [...list].sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        return list;
    }, [users, search, showDeleted, sortKey, sortDir]);

    const activeCount = users.filter((u) => !u.deleted_at).length;
    const deletedCount = users.filter((u) => u.deleted_at).length;

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* ------------------------------------------------------------------ */}
            {/* Page header                                                          */}
            {/* ------------------------------------------------------------------ */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Platform-level user accounts.{" "}
                        <span className="text-foreground font-medium">{activeCount} active</span>
                        {deletedCount > 0 && (
                            <>, <span className="text-muted-foreground">{deletedCount} deleted</span></>
                        )}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus size={15} strokeWidth={2} />
                    New user
                </Button>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* Toolbar                                                              */}
            {/* ------------------------------------------------------------------ */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        className="pl-9"
                        placeholder="Search username or ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant={showDeleted ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowDeleted((v) => !v)}
                >
                    {showDeleted ? "Hide deleted" : "Show deleted"}
                </Button>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* Table                                                                */}
            {/* ------------------------------------------------------------------ */}
            {/* ── Mobile: card list ──────────────────────────────────────────────── */}
            <div className="md:hidden flex flex-col gap-3">
                {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No users match your search.
                    </p>
                )}
                {filtered.map((user) => {
                    const isDeleted = !!user.deleted_at;
                    return (
                        <div
                            key={user.id}
                            className={`bg-card border p-4 flex items-center gap-3 ${isDeleted ? "opacity-50" : ""}`}
                        >
                            <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                    {initials(user.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.username}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <code className="text-xs text-muted-foreground font-mono truncate">{user.id}</code>
                                    <CopyId id={user.id} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {isDeleted ? (
                                    <Badge variant="destructive" className="text-xs font-normal">Deleted</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">Active</Badge>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground">
                                        <DropdownMenuItem onClick={() => setResetTarget(user)}>
                                            <KeyRound className="w-4 h-4 mr-2" />
                                            Reset password
                                        </DropdownMenuItem>
                                        {!isDeleted && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(user)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete user
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Desktop: table ─────────────────────────────────────────────────── */}
            <div className="hidden md:block border overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-10 pl-4" />
                            <TableHead>
                                <SortButton col="username" label="Username" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-xs text-muted-foreground font-medium">
                                User ID
                            </TableHead>
                            <TableHead>
                                <SortButton col="created_at" label="Created" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                            <TableHead className="w-10 pr-4" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    No users match your search.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((user) => {
                            const isDeleted = !!user.deleted_at;
                            return (
                                <TableRow key={user.id} className={`group ${isDeleted ? "opacity-50" : ""}`}>
                                    <TableCell className="pl-4 pr-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                {initials(user.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{user.username}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <code className="text-xs text-muted-foreground font-mono">{user.id}</code>
                                            <CopyId id={user.id} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(user.created_at)}
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
                                                <DropdownMenuItem onClick={() => setResetTarget(user)}>
                                                    <KeyRound className="w-4 h-4 mr-2" />
                                                    Reset password
                                                </DropdownMenuItem>
                                                {!isDeleted && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteTarget(user)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete user
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

            {/* Row count */}
            <p className="text-xs text-muted-foreground pl-1">
                Showing {filtered.length} of {users.length} users
            </p>

            {/* ------------------------------------------------------------------ */}
            {/* Dialogs                                                              */}
            {/* ------------------------------------------------------------------ */}
            <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
            <DeleteUserDialog
                user={deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
            />
            <ResetPasswordDialog
                user={resetTarget}
                onOpenChange={(v) => !v && setResetTarget(null)}
            />
        </div>
    );
}