"use client";

import { use, useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Loader,
    Check,
    AlertCircle,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ApiKeyRecordResponse, CreateApiKeyResponse } from "@/lib/api-types";





// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

// ---------------------------------------------------------------------------
// Raw token reveal — shown once after key creation
// ---------------------------------------------------------------------------

function TokenReveal({ token }: { token: string }) {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex border border-input overflow-hidden">
                <input
                    type={visible ? "text" : "password"}
                    readOnly
                    value={token}
                    className="flex-1 px-3 py-2 text-sm bg-muted font-mono text-foreground outline-none"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="px-3 border-l border-input bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 border-l border-input bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
            </div>
            <p className="text-xs text-warning">
                Copy this token now — it will not be shown again.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Create Key Dialog
// ---------------------------------------------------------------------------

function CreateKeyDialog({
    open,
    onOpenChange,
    orgId,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    orgId: string;
    onCreated: (key: CreateApiKeyResponse) => void;
}) {
    const [name, setName] = useState("");
    const [state, setState] = useState<"idle" | "error" | "loading" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setName("");
            setState("idle");
            setErrorMsg("");
        }, 200);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setState("error");
            setErrorMsg("Key name is required.");
            return;
        }
        setState("loading");
        try {
            // POST /v2/orgs/{org_id}/api-keys — CreateApiKeyRequest { name }
            // Returns CreateApiKeyResponse { ...ApiKeyRecordResponse, raw_token }
            const res = await fetch(`/api/orgs/${orgId}/api-keys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Failed to create key.");
            const key: CreateApiKeyResponse = await res.json();
            onCreated(key);
            setState("success");
            setTimeout(handleClose, 800);
        } catch (err) {
            setState("error");
            setErrorMsg(err instanceof Error ? err.message : "Failed to create key.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Create API key</DialogTitle>
                    <DialogDescription>
                        Give this key a descriptive name — e.g. the agent or integration that will use it.
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
                        <Label htmlFor="key-name">Name</Label>
                        <Input
                            id="key-name"
                            placeholder="e.g. Miro Sidekick integration"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setState("idle"); }}
                            disabled={isLoading || isSuccess}
                            autoFocus
                            maxLength={128}
                            className={cn(state === "error" && !name.trim() && "border-destructive")}
                        />
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isSuccess} className="gap-2 min-w-[130px]">
                            {isLoading
                                ? <><Loader size={14} className="animate-adxc-spin" /> Creating…</>
                                : isSuccess
                                    ? <><Check size={14} /> Created</>
                                    : "Create API key"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Delete key dialog
// ---------------------------------------------------------------------------

function DeleteKeyDialog({
    apiKey,
    onOpenChange,
    orgId,
    onDelete,
}: {
    apiKey: ApiKeyRecordResponse | null;
    onOpenChange: (v: boolean) => void;
    orgId: string;
    onDelete: (id: number) => void;
}) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!apiKey) return;
        setLoading(true);
        try {
            // DELETE /v2/orgs/{org_id}/api-keys/{key_id}
            const res = await fetch(`/api/orgs/${orgId}/api-keys/${apiKey.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete key.");
            onDelete(apiKey.id);
            onOpenChange(false);
        } catch {
            // TODO: show error toast
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={!!apiKey} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Delete API key</DialogTitle>
                    <DialogDescription>
                        Delete{" "}
                        <span className="font-semibold text-foreground">{apiKey?.name}</span>?
                        Any agent using this key will immediately lose access.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting…" : "Delete key"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Token reveal dialog — shown once after successful key creation
// ---------------------------------------------------------------------------

function TokenRevealDialog({
    createdKey,
    onOpenChange,
}: {
    createdKey: CreateApiKeyResponse | null;
    onOpenChange: (v: boolean) => void;
}) {
    return (
        <Dialog
            open={!!createdKey}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[460px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>API key created</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{createdKey?.name}</span> has been
                        created. Copy the token below — it will only be shown once.
                    </DialogDescription>
                </DialogHeader>
                {createdKey && (
                    <div className="py-2">
                        <TokenReveal token={createdKey.raw_token} />
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgApiKeysPage({
    params: paramsPromise,
}: {
    params: Promise<{ org_id: string }>;
}) {
    const { org_id } = use(paramsPromise);

    const [keys, setKeys] = useState<ApiKeyRecordResponse[]>([]);
    const [loading, setLoading] = useState(true);
    // GET /v2/orgs/{org_id}/api-keys → ApiKeyListResponse { keys }
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/api-keys`)
            .then((r) => r.json())
            .then((data) => setKeys(data.keys ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [org_id]);

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ApiKeyRecordResponse | null>(null);
    const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);

    function handleCreated(key: CreateApiKeyResponse) {
        setKeys((prev) => [...prev, key]);
        setCreatedKey(key);
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={15} className="animate-adxc-spin" />
                Loading…
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Keys for agents and integrations to query ADXC programmatically.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
                        <Plus size={15} strokeWidth={2} />
                        New API key
                    </Button>
                </div>

                {/* ── Keys list ──────────────────────────────────────────────────── */}
                {keys.length === 0 ? (
                    <div className="border p-12 flex flex-col items-center gap-3 text-center bg-card">
                        <div className="w-10 h-10 bg-accent flex items-center justify-center text-muted-foreground">
                            <KeyRound size={18} />
                        </div>
                        <p className="text-sm font-medium">No API keys yet</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Create a key to allow AI agents and integrations to query ADXC on behalf of your organisation.
                        </p>
                        <Button
                            size="sm"
                            className="gap-2 mt-1"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={14} strokeWidth={2} />
                            Create first key
                        </Button>
                    </div>
                ) : (
                    <div className="border overflow-hidden bg-card">
                        {keys.map((key, i) => (
                            <div
                                key={key.id}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 group",
                                    i < keys.length - 1 && "border-b border-border"
                                )}
                            >
                                {/* Icon */}
                                <div className="w-8 h-8 bg-accent flex items-center justify-center text-muted-foreground shrink-0">
                                    <KeyRound size={14} />
                                </div>

                                {/* Name + prefix */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{key.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {key.key_prefix}••••••••
                                    </p>
                                </div>

                                {/* Created date */}
                                <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                                    Created {formatDate(key.created_at)}
                                </span>

                                {/* Status */}
                                <Badge
                                    variant="outline"
                                    className="text-xs font-normal text-success border-success/40 bg-success/5 shrink-0"
                                >
                                    Active
                                </Badge>

                                {/* Delete */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => setDeleteTarget(key)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Usage note ─────────────────────────────────────────────────── */}
                <div className="bg-card border p-4 flex flex-col gap-1.5">
                    <p className="text-sm font-medium">Using API keys</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Pass the token as a Bearer token in the{" "}
                        <code className="text-xs bg-accent px-1 py-0.5 rounded">Authorization</code>{" "}
                        header. Queries made via API key are charged to your organisation's balance and
                        appear in your queries list as owner kind{" "}
                        <code className="text-xs bg-accent px-1 py-0.5 rounded">org_automation</code>.
                    </p>
                </div>

            </div>

            {/* ── Dialogs ──────────────────────────────────────────────────────── */}
            <CreateKeyDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                orgId={org_id}
                onCreated={handleCreated}
            />
            <DeleteKeyDialog
                apiKey={deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                orgId={org_id}
                onDelete={(id) => setKeys((prev) => prev.filter((k) => k.id !== id))}
            />
            <TokenRevealDialog
                createdKey={createdKey}
                onOpenChange={(v) => !v && setCreatedKey(null)}
            />
        </>
    );
}