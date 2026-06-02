"use client";

// app/(app)/admin/users/page.tsx
//
// Platform admin — Users.
// Actions: create user (dialog), reset password (dialog), delete (confirmation dialog).
// TODO: wire all actions to real API endpoints

import { useState } from "react";
import {
    KeyRound, Trash2, Plus, Loader,
    AlertCircle, Check, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Types + mock data ────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/users

type User = { id: string; username: string };

const MOCK_USERS: User[] = [
    { id: "c0ba41cc-cfc5-4ca3-ad91-32cacb101224", username: "george" },
    { id: "e9bb5415-7b86-4256-94b9-8ef15bc019aa", username: "iti" },
    { id: "e9c0d812-cb1c-462d-bbbf-2675cff24d56", username: "joseph" },
    { id: "b538a800-fcf8-42aa-ac07-8616ee054916", username: "josh" },
    { id: "32cb77d3-dcb1-4f24-8ad0-aea21870c3c3", username: "marko" },
    { id: "2b6f49d3-f6c9-4ede-9a55-6b4eee591095", username: "rob" },
    { id: "3e01c66f-d812-4e06-8611-7c5290972a34", username: "roy" },
    { id: "bacbc481-02d6-4732-8724-7b331bfd140f", username: "unicron" },
];

// ─── Shared password input with eye toggle ────────────────────────────────────
// Matches the pattern used in (auth)/login/page.tsx

function PasswordInput({
    id,
    value,
    onChange,
    disabled,
    placeholder = "••••••••",
    hasError,
    autoFocus,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    placeholder?: string;
    hasError?: boolean;
    autoFocus?: boolean;
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                autoComplete="new-password"
                autoFocus={autoFocus}
                className={cn("pr-10", hasError && "border-destructive focus-visible:ring-ring-error")}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShow(v => !v)}
                tabIndex={-1}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </Button>
        </div>
    );
}

// ─── Create user dialog ───────────────────────────────────────────────────────

function CreateUserDialog({
    open, onOpenChange, onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (user: User) => void;
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => { setUsername(""); setPassword(""); setState("idle"); setErrorMsg(""); }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (state === "loading") return;

        if (!username.trim()) { setErrorMsg("Username is required."); setState("error"); return; }
        // Pattern from CreateUserRequest schema: ^[A-Za-z0-9_.\-]+$
        if (!/^[A-Za-z0-9_.\-]+$/.test(username.trim())) {
            setErrorMsg("Username can only contain letters, numbers, underscores, dots and hyphens.");
            setState("error"); return;
        }
        if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); setState("error"); return; }

        setState("loading");
        try {
            // TODO: POST /admin/users { username, password }
            await new Promise(r => setTimeout(r, 800));
            onCreated({ id: crypto.randomUUID(), username: username.trim() });
            setState("success");
            setTimeout(handleClose, 1000);
        } catch {
            setErrorMsg("Failed to create user. Try again.");
            setState("error");
        }
    }

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
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
                            onChange={e => { setUsername(e.target.value); setState("idle"); }}
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
                            onChange={v => { setPassword(v); setState("idle"); }}
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

// ─── Set password dialog ──────────────────────────────────────────────────────

function SetPasswordDialog({
    user, open, onOpenChange,
}: {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [password, setPassword] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => { setPassword(""); setState("idle"); }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password.length < 8) { setState("error"); return; }
        setState("loading");
        try {
            // TODO: POST /admin/users/:id/set-password { password }
            await new Promise(r => setTimeout(r, 700));
            setState("success");
            setTimeout(handleClose, 1200);
        } catch { setState("error"); }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
            <DialogContent className="sm:max-w-[400px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Reset password</DialogTitle>
                    <DialogDescription>
                        Set a new password for <strong>{user?.username}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="set-password">
                            New password{" "}
                            <span className="text-muted-foreground font-normal">(min 8)</span>
                        </Label>
                        <PasswordInput
                            id="set-password"
                            value={password}
                            onChange={v => { setPassword(v); setState("idle"); }}
                            disabled={state === "loading" || state === "success"}
                            hasError={state === "error"}
                            autoFocus
                        />
                        {state === "error" && (
                            <p className="text-xs text-destructive-text">
                                Password must be at least 8 characters.
                            </p>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={state === "loading"}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={state === "loading" || state === "success"}
                            className="gap-2 min-w-[120px]"
                        >
                            {state === "loading" ? (
                                <><Loader size={14} className="animate-adxc-spin" /> Saving…</>
                            ) : state === "success" ? (
                                <><Check size={14} /> Saved</>
                            ) : "Set password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteUserDialog({
    user, open, onOpenChange, onDeleted,
}: {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: (id: string) => void;
}) {
    const [state, setState] = useState<"idle" | "loading">("idle");

    async function handleDelete() {
        setState("loading");
        try {
            // TODO: DELETE /admin/users/:id
            await new Promise(r => setTimeout(r, 700));
            onDeleted(user!.id);
            onOpenChange(false);
        } catch { setState("idle"); }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
            <DialogContent className="sm:max-w-[400px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Delete user</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{user?.username}</strong>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={state === "loading"}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={state === "loading"}
                        className="gap-2 min-w-[120px]"
                    >
                        {state === "loading" ? (
                            <><Loader size={14} className="animate-adxc-spin" /> Deleting…</>
                        ) : "Delete user"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Users table ──────────────────────────────────────────────────────────────

function UsersTable({
    users, onSetPassword, onDelete,
}: {
    users: User[];
    onSetPassword: (user: User) => void;
    onDelete: (user: User) => void;
}) {
    if (users.length === 0) {
        return (
            <div className="rounded-xl border border-border flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">No users yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-5 py-3 bg-accent/50 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</span>
                <span className="sr-only">Actions</span>
            </div>
            <div className="divide-y divide-border">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-accent/30 transition-colors duration-100"
                    >
                        <span className="text-sm font-medium text-foreground tracking-[-0.01em]">
                            {user.username}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                            {user.id}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => onSetPassword(user)}
                            >
                                <KeyRound size={13} strokeWidth={1.8} />
                                Reset password
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive-subtle"
                                onClick={() => onDelete(user)}
                                aria-label={`Delete ${user.username}`}
                            >
                                <Trash2 size={14} strokeWidth={1.8} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [createOpen, setCreateOpen] = useState(false);
    const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    return (
        <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-foreground">Users</h2>
                    <p className="m-0 text-sm text-muted-foreground tracking-wide">
                        {users.length} active {users.length === 1 ? "account" : "accounts"}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus size={15} strokeWidth={2} />
                    New user
                </Button>
            </div>

            <UsersTable
                users={users}
                onSetPassword={setPasswordTarget}
                onDelete={setDeleteTarget}
            />

            <CreateUserDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={(user) => setUsers(prev => [...prev, user])}
            />
            <SetPasswordDialog
                user={passwordTarget}
                open={!!passwordTarget}
                onOpenChange={(open) => !open && setPasswordTarget(null)}
            />
            <DeleteUserDialog
                user={deleteTarget}
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onDeleted={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
            />

        </div>
    );
}