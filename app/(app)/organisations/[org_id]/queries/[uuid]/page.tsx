"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import type { SourceAttribution } from "@/lib/api-types";

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

function formatTokens(value: string) {
    const n = parseFloat(value);
    if (isNaN(n)) return "—";
    return `${new Intl.NumberFormat("en-US").format(n)} tokens`;
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
    const searchParams = useSearchParams();
    const base = `/organisations/${org_id}`;

    // owner context from query params — passed by the list page
    const ownerKind = (searchParams.get("owner_kind") ?? null) as "member" | "org_automation" | null;
    const ownerMemberId = searchParams.get("owner_member_id") ?? null;

    // Org name — fetch from memberships since not in AnswerPreviewResponse
    const [orgName, setOrgName] = useState("");
    useEffect(() => {
        fetch("/api/orgs")
            .then((r) => r.json())
            .then((data) => {
                const match = (data.orgs ?? []).find((o: { org_id: string; org_name: string }) => o.org_id === org_id);
                if (match) setOrgName(match.org_name);
            })
            .catch(() => { });
    }, [org_id]);

    const [question, setQuestion] = useState("");
    const [abstract, setAbstract] = useState("");
    const [price, setPrice] = useState("");
    const [paid, setPaid] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState("");
    const [sources, setSources] = useState<SourceAttribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);

    // GET /v2/orgs/{org_id}/answers/{uuid}
    // Returns AnswerPreviewResponse: { uuid, question, abstract, price, paid, answer?, sources }
    useEffect(() => {
        fetch(`/api/orgs/${org_id}/answers/${uuid}`)
            .then((r) => r.json())
            .then((data) => {
                setQuestion(data.question ?? "");
                setAbstract(data.abstract ?? "");
                setPrice(data.price ?? "");
                setPaid(data.paid ?? false);
                setAnswer(data.answer ?? null);
                setCreatedAt(data.created_at ?? "");
                setSources(data.sources ?? []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [org_id, uuid]);

    async function handleApprove() {
        setApproving(true);
        try {
            // POST /v2/orgs/{org_id}/answers/{uuid}/approve
            // Returns AnswerApproveResponse: { uuid, paid, charged_now, answer }
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
                    <h1 className="text-xl font-semibold leading-snug">{question}</h1>
                </div>
                <div className="text-2xl font-semibold tabular-nums sm:shrink-0 text-foreground">
                    {price ? formatTokens(price) : "—"}
                </div>
            </div>

            {/* ── Meta ─────────────────────────────────────────────────────────── */}
            {/* TODO: owner_member_id, owner_kind, created_at not in AnswerPreviewResponse yet — Rob to add */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card border p-4">
                <MetaItem icon={Building2} label="Organisation">
                    {orgName || org_id}
                </MetaItem>
                <MetaItem icon={User} label="Submitted by">
                    {ownerKind === "org_automation" ? (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            API key
                        </Badge>
                    ) : ownerMemberId ? (
                        <span>Member #{ownerMemberId}</span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </MetaItem>
                {createdAt && (
                    <MetaItem icon={Clock} label="Submitted">
                        {formatDate(createdAt)}
                    </MetaItem>
                )}
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{abstract}</p>
                    </div>
                </div>
            )}

            {/* ── Sources ──────────────────────────────────────────────────────── */}
            {sources.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold">Data sources</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sources.map((source) => (
                            <div key={source.source_id} className="bg-card border p-3 flex items-center justify-between gap-3">
                                <span className="text-sm font-medium truncate">{source.display_name}</span>
                                {source.row_count != null && (
                                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                        {new Intl.NumberFormat("en-US").format(source.row_count)} rows
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Full answer or Approve CTA ────────────────────────────────────── */}
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
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{answer}</p>
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
                            Approving will charge {price ? formatTokens(price) : "—"} to your organisation's balance and release the full answer.
                        </p>
                    </div>
                    <Button onClick={handleApprove} disabled={approving} className="shrink-0 gap-2">
                        {approving ? <><Loader size={14} className="animate-adxc-spin" /> Approving…</> : "Approve & charge"}
                    </Button>
                </div>
            ) : null}

        </div>
    );
}