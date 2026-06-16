"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Clock, CheckCircle, Loader } from "lucide-react";
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
    owner_kind: "member" | "org_automation" | null;
    owner_member_id: number | null;
    created_at: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

// ---------------------------------------------------------------------------
// Meta item
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

export default function OrgQueryDetailPage({
    params: paramsPromise,
}: {
    params: Promise<{ org_id: string; uuid: string }>;
}) {
    const { org_id, uuid } = use(paramsPromise);
    const base = `/organisations/${org_id}`;

    const [query, setQuery] = useState<QueryDetail | null>(null);
    const [paid, setPaid] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);

    // GET /v2/orgs/{org_id}/answers/{uuid} — fetch answer detail
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/answers/${uuid}`)
            .then((r) => r.json())
            .then((data) => {
                setQuery(data);
                setPaid(data.paid ?? false);
                setAnswer(data.answer ?? null);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [org_id, uuid]);


    async function handleApprove() {
        setApproving(true);
        try {
            // POST /v2/orgs/{org_id}/answers/{uuid}/approve
            const res = await fetch(`/api/orgs/${org_id}/answers/${uuid}/approve`, { method: "POST" });
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
            <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={15} className="animate-adxc-spin" />
                Loading…
            </div>
        );
    }

    if (!query) {
        return (
            <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
                <Link
                    href={`${base}/queries`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-6"
                >
                    <ArrowLeft size={14} />
                    Queries
                </Link>
                <p className="text-sm text-muted-foreground">Query not found.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Back ─────────────────────────────────────────────────────────── */}
            <Link
                href={`${base}/queries`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft size={14} />
                Queries
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
                        <span className="text-xs text-muted-foreground font-mono">{uuid}</span>
                    </div>
                    <h1 className="text-xl font-semibold leading-snug">{query.question}</h1>
                </div>
                <div className="text-2xl font-semibold tabular-nums sm:shrink-0">
                    {formatCurrency(query.price)}
                </div>
            </div>

            {/* ── Meta ─────────────────────────────────────────────────────────── */}
            {/* TODO: owner_member_id, owner_kind, created_at not in AnswerPreviewResponse yet — Rob to add */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-card border p-4">
                <MetaItem icon={User} label="Submitted by">
                    {query.owner_kind === "org_automation" ? (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            API key
                        </Badge>
                    ) : (
                        <span>Member #{query.owner_member_id}</span>
                    )}
                </MetaItem>
                <MetaItem icon={Clock} label="Submitted">
                    {formatDate(query.created_at ?? "")}
                </MetaItem>
                {paid && (
                    <MetaItem icon={CheckCircle} label="Approved">
                        Approved
                    </MetaItem>
                )}
            </div>

            {/* ── Abstract — only shown before approval ── */}
            {!paid && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold">Abstract</h2>
                    <div className="bg-card border p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {query.abstract}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Full answer or Approve CTA ────────────────────────────────────── */}
            {paid && answer ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Full answer</h2>
                        <div className="flex items-center gap-2">
                            {/* TODO: GET /v2/orgs/{org_id}/answers/{uuid}/json */}
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                                JSON
                            </Button>
                            {/* TODO: GET /v2/orgs/{org_id}/answers/{uuid}/csv */}
                            <Button variant="outline" size="sm" className="h-7 text-xs">
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
            ) : !paid ? (
                <div className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4",
                    "border-warning/30 bg-warning/5"
                )}>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">Ready to approve</p>
                        <p className="text-xs text-muted-foreground">
                            Approving will charge {formatCurrency(query.price)} to your organisation's balance and unlock the full answer.
                        </p>
                    </div>
                    <Button
                        onClick={handleApprove}
                        disabled={approving}
                        className="gap-2 shrink-0"
                    >
                        {approving ? "Approving…" : "Approve & charge"}
                    </Button>
                </div>
            ) : null}

        </div>
    );
}