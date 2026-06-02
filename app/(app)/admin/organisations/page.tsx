"use client";

// app/(app)/admin/organisations/page.tsx
//
// Platform admin — Organisations.
// Actions: create org (dialog with preset chips + prefixed input), manage org (detail page).
// TODO: wire all actions to real API endpoints

import React, { useState } from "react";
import { Plus, Loader, AlertCircle, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Types + mock data ────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/organisations

type Org = {
    id: number;
    name: string;
    balance: number;
    dailyMemberSpendCap: number | null;
};

const MOCK_ORGS: Org[] = [
    { id: 1, name: "smoke_test", balance: 902, dailyMemberSpendCap: null },
    { id: 2, name: "Josh_Test", balance: 100, dailyMemberSpendCap: null },
    { id: 3, name: "unicron test", balance: 10000, dailyMemberSpendCap: null },
    { id: 4, name: "george_test", balance: 1000, dailyMemberSpendCap: null },
    { id: 5, name: "dept_beta", balance: 1000, dailyMemberSpendCap: null },
    { id: 6, name: "iti_test", balance: 275, dailyMemberSpendCap: 100 },
];

function formatBalance(n: number) {
    return "$" + n.toLocaleString();
}

// ─── Cap presets ──────────────────────────────────────────────────────────────

const CAP_PRESETS: { label: string; value: number | null }[] = [
    { label: "Unlimited", value: null },
    { label: "Blocked", value: 0 },
    { label: "$25", value: 25 },
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
    { label: "$500", value: 500 },
];

// ─── Create org dialog ────────────────────────────────────────────────────────

function CreateOrgDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (org: Org) => void;
}) {
    const [name, setName] = useState("");
    const [cap, setCap] = useState("");
    const [activePreset, setActivePreset] = useState(0); // 0 = Unlimited by default
    const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setName(""); setCap(""); setActivePreset(0);
            setState("idle"); setErrorMsg("");
        }, 200);
    }

    function handlePresetClick(idx: number) {
        const preset = CAP_PRESETS[idx];
        setActivePreset(idx);
        setCap(preset.value === null ? "" : String(preset.value));
        setState("idle");
    }

    function handleCapInput(val: string) {
        setCap(val);
        setActivePreset(-1);
        setState("idle");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (state === "loading") return;

        if (!name.trim()) {
            setErrorMsg("Organisation name is required.");
            setState("error");
            return;
        }

        const capValue = cap.trim() === "" ? null : Number(cap);
        if (cap.trim() !== "" && (isNaN(capValue!) || capValue! < 0)) {
            setErrorMsg("Daily spend cap must be a valid positive number.");
            setState("error");
            return;
        }

        setState("loading");
        try {
            // TODO: POST /admin/organisations { name, daily_member_spend_cap: capValue }
            await new Promise(r => setTimeout(r, 800));
            onCreated({
                id: Math.floor(Math.random() * 10000),
                name: name.trim(),
                balance: 0,
                dailyMemberSpendCap: capValue,
            });
            setState("success");
            setTimeout(handleClose, 1000);
        } catch {
            setErrorMsg("Failed to create organisation. Try again.");
            setState("error");
        }
    }

    const isLoading = state === "loading";
    const isSuccess = state === "success";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* TODO: replace bg-card override with --dialog token once DS audit done */}
            <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground gap-0 p-0 overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[17px]">New organisation</DialogTitle>
                        <DialogDescription className="mt-1">
                            Create a new organisation and set its initial configuration.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="px-6 pt-6 pb-4 flex flex-col gap-6">

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
                                placeholder="e.g. Acme Corp"
                                value={name}
                                onChange={e => { setName(e.target.value); setState("idle"); }}
                                disabled={isLoading || isSuccess}
                                autoComplete="off"
                                autoFocus
                                className={cn(state === "error" && !name.trim() && "border-destructive")}
                            />
                        </div>

                        {/* Daily member spend cap */}
                        {/* TODO: move to org settings once backend supports PATCH /admin/organisations/:id */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between">
                                <Label htmlFor="org-cap">Daily member spend cap</Label>
                                <span className="text-xs text-muted-foreground">optional</span>
                            </div>

                            {/* Preset chips — smaller, lighter */}
                            <div className="flex flex-wrap gap-1.5">
                                {CAP_PRESETS.map((preset, idx) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        disabled={isLoading || isSuccess}
                                        onClick={() => handlePresetClick(idx)}
                                        className={cn(
                                            "h-6 px-2.5 rounded-full text-[11px] font-medium border transition-colors duration-100 cursor-pointer",
                                            activePreset === idx
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-border hover:border-border-3 hover:text-foreground"
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Prefixed $ input */}
                            <div className={cn(
                                "flex rounded-md border border-border overflow-hidden",
                                "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",
                                "transition-shadow duration-100"
                            )}>
                                <span className="flex items-center px-3 bg-muted border-r border-border text-sm font-medium text-muted-foreground select-none shrink-0 w-10 justify-center">
                                    $
                                </span>
                                <input
                                    id="org-cap"
                                    type="number"
                                    min={0}
                                    placeholder={
                                        activePreset === 0 ? "Unlimited" :
                                            activePreset === 1 ? "0 — all spend blocked" :
                                                "Custom amount"
                                    }
                                    value={cap}
                                    onChange={e => handleCapInput(e.target.value)}
                                    disabled={isLoading || isSuccess}
                                    className="flex-1 h-10 px-3 bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 min-w-0"
                                />
                            </div>

                            {/* Immutability callout — compact */}
                            <div className="flex gap-2.5 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2">
                                <AlertCircle size={13} className="text-warning shrink-0 mt-[1px]" />
                                <p className="text-[11px] text-warning leading-[1.5]">
                                    <strong>Cannot be changed after creation.</strong>{" "}
                                    Use <strong>Blocked</strong> to prevent all member spend, or <strong>Unlimited</strong> for no cap.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer — separated with border */}
                    <div className="px-6 py-4 border-t border-border bg-accent/30 flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isSuccess}
                            className="gap-2 min-w-[160px]"
                        >
                            {isLoading ? (
                                <><Loader size={14} className="animate-adxc-spin" /> Creating…</>
                            ) : isSuccess ? (
                                <><Check size={14} /> Created</>
                            ) : (
                                "Create organisation"
                            )}
                        </Button>
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    );
}

// ─── Orgs table ───────────────────────────────────────────────────────────────

function OrgsTable({ orgs }: { orgs: Org[] }) {
    if (orgs.length === 0) {
        return (
            <div className="rounded-xl border border-border flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">No organisations yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_120px_120px_80px] gap-4 px-5 py-3 bg-accent/50 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Balance</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Daily cap</span>
                <span className="sr-only">Actions</span>
            </div>

            <div className="divide-y divide-border">
                {orgs.map((org) => (
                    <div
                        key={org.id}
                        className="grid grid-cols-[40px_1fr_120px_120px_80px] gap-4 items-center px-5 py-3.5 hover:bg-accent/30 transition-colors duration-100"
                    >
                        <span className="text-xs text-muted-foreground font-mono">{org.id}</span>
                        <span className="text-sm font-medium text-foreground tracking-[-0.01em]">{org.name}</span>
                        <span className="text-sm font-medium text-foreground tabular-nums text-right">
                            {formatBalance(org.balance)}
                        </span>
                        <span className="text-sm tabular-nums text-right">
                            {org.dailyMemberSpendCap === null ? (
                                <span className="text-xs text-muted-foreground">Unlimited</span>
                            ) : org.dailyMemberSpendCap === 0 ? (
                                <span className="text-xs text-destructive-text font-medium">Blocked</span>
                            ) : (
                                <span className="text-muted-foreground">{formatBalance(org.dailyMemberSpendCap)}</span>
                            )}
                        </span>
                        <div className="flex justify-end">
                            <Link
                                href={`/admin/organisations/${org.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline tracking-[-0.01em] transition-colors"
                            >
                                Manage
                                <ExternalLink size={11} strokeWidth={2} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganisationsPage() {
    const [orgs, setOrgs] = useState<Org[]>(MOCK_ORGS);
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-foreground">Organisations</h2>
                    <p className="m-0 text-sm text-muted-foreground tracking-wide">
                        {orgs.length} active {orgs.length === 1 ? "organisation" : "organisations"}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus size={15} strokeWidth={2} />
                    New organisation
                </Button>
            </div>

            <OrgsTable orgs={orgs} />

            <CreateOrgDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={(org) => setOrgs(prev => [...prev, org])}
            />

        </div>
    );
}