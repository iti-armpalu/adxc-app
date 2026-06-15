"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    User,
    Clock,
    CheckCircle,
    Loader,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueryDetail = {
    uuid: string;
    question: string;
    abstract: string;
    price: string;
    paid: boolean;
    answer: string | null;
    // Context carried from list via query params
    // TODO: remove once GET /v1/answers/{uuid} includes org + owner info
    org_id: number;
    org_name: string;
    owner_kind: "member" | "org_automation";
    owner_username: string | null;
    created_at: string;
    paid_at: string | null;
};

// ---------------------------------------------------------------------------
// (Mock data removed — page now fetches from GET /v1/answers/{uuid})
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

// ---------------------------------------------------------------------------
// Meta row
// ---------------------------------------------------------------------------

function MetaItem({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm text-foreground">{children}</span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QueryDetailPage({
    params: paramsPromise,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const params = use(paramsPromise);
    const searchParams = useSearchParams();


    // Core answer state
    const [question, setQuestion] = useState("");
    const [abstract, setAbstract] = useState("");
    const [price, setPrice] = useState("");
    const [paid, setPaid] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState("");
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);

    // Context from query params — passed by the list page
    // TODO: remove once GET /v1/answers/{uuid} includes org + owner fields
    const orgId = searchParams.get("org_id") ?? "";
    const orgName = searchParams.get("org_name") ?? "Unknown organisation";
    const ownerKind = (searchParams.get("owner_kind") ?? "member") as "member" | "org_automation";
    const ownerName = searchParams.get("owner") ?? null;

    // Fetch answer — GET /v1/answers/{answer_uuid}
    // Returns AnswerPreviewResponse: { uuid, question, abstract, price, paid, answer? }
    useEffect(() => {
        fetch(`/api/answers/${params.uuid}`)
            .then((r) => r.json())
            .then((data) => {
                setQuestion(data.question ?? "");
                setAbstract(data.abstract ?? "");
                setPrice(data.price ?? "");
                setPaid(data.paid ?? false);
                setAnswer(data.answer ?? null);
                setCreatedAt(data.created_at ?? "");
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [params.uuid]);

    // Check if current admin is a member of this org
    // GET /v2/orgs → check if org_id is in user's memberships
    const [isMemberOfOrg, setIsMemberOfOrg] = useState(false);
    useEffect(() => {
        if (!orgId) return;
        fetch("/api/orgs")
            .then((r) => r.json())
            .then((data) => {
                const ids: string[] = (data.memberships ?? []).map((m: { org_id: string }) => m.org_id);
                setIsMemberOfOrg(ids.includes(orgId));
            })
            .catch(() => { });
    }, [orgId]);

    async function handleApprove() {
        setApproving(true);
        try {
            // POST /v1/answers/{answer_uuid}/approve
            // Returns AnswerApproveResponse: { uuid, paid, charged_now, answer }
            const res = await fetch(`/api/answers/${params.uuid}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setAnswer(data.answer);
            setPaid(true);
        } catch {
            // TODO: show error toast
        } finally {
            setApproving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={15} className="animate-adxc-spin" />
                Loading…
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Back ─────────────────────────────────────────────────────────── */}
            <Link
                href="/admin/queries"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft size={14} />
                All queries
            </Link>

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                        {paid ? (
                            <Badge variant="outline" className="text-xs font-normal text-success border-success/40 bg-success/5">
                                Approved
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs font-normal text-warning border-warning/40 bg-warning/5">
                                Pending approval
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                            {params.uuid}
                        </span>
                    </div>
                    <h1 className="text-xl font-semibold leading-snug">
                        {question}
                    </h1>
                </div>
                <div className="text-2xl font-semibold tabular-nums sm:shrink-0 text-foreground">
                    {price ? formatCurrency(price) : "—"}
                </div>
            </div>

            {/* ── Meta ─────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card border p-4">
                <MetaItem icon={Building2} label="Organisation">
                    <Link
                        href={`/admin/organisations/${orgId}`}
                        className="hover:text-primary transition-colors"
                    >
                        {orgName}
                    </Link>
                </MetaItem>
                <MetaItem icon={User} label="Submitted by">
                    {ownerKind === "org_automation" ? (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            API key
                        </Badge>
                    ) : (
                        <span>{ownerName ?? "—"}</span>
                    )}
                </MetaItem>
                <MetaItem icon={Clock} label="Submitted">
                    {createdAt ? formatDate(createdAt) : "—"}
                </MetaItem>
                {paid && (
                    <MetaItem icon={CheckCircle} label="Approved">
                        Approved
                    </MetaItem>
                )}
            </div>

            {/* ── Abstract — only shown before approval ────────────────────────── */}
            {!paid && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold">Abstract</h2>
                    <div className="bg-card border p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {abstract}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Full answer (paid) or Approve CTA (pending) ───────────────────── */}
            {paid && answer ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Full answer</h2>
                        <div className="flex items-center gap-2">
                            {/* TODO: GET /v2/orgs/{org_id}/answers/{uuid}/json */}
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                                <Download size={12} />
                                JSON
                            </Button>
                            {/* TODO: GET /v2/orgs/{org_id}/answers/{uuid}/csv */}
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                                <Download size={12} />
                                CSV
                            </Button>
                        </div>
                    </div>
                    <div className="bg-card border p-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {answer}
                        </p>
                    </div>
                </div>
            ) : !paid && isMemberOfOrg ? (
                <div className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4",
                    "border-warning/30 bg-warning/5"
                )}>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">Ready to approve</p>
                        <p className="text-xs text-muted-foreground">
                            Approving will charge {price ? formatCurrency(price) : "—"} to {orgName}'s balance and release the full answer.
                        </p>
                    </div>
                    <Button onClick={handleApprove} disabled={approving} className="shrink-0">
                        {approving ? <><Loader size={14} className="animate-adxc-spin" /> Approving…</> : "Approve & charge"}
                    </Button>
                </div>
            ) : !paid && !isMemberOfOrg ? (
                <div className="border p-4 text-sm text-muted-foreground">
                    You are not a member of{" "}
                    <span className="font-medium text-foreground">{orgName}</span>.
                    Add yourself to this organisation to approve queries on their behalf.
                </div>
            ) : null}

        </div>
    );
}