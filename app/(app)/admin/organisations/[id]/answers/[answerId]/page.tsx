"use client";

// app/(app)/admin/organisations/[id]/answers/[answerId]/page.tsx
//
// Admin view of a single answer.
// Shows everything regardless of paid status — no gating for admins.
// TODO: wire to real API endpoints

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types + mock data ────────────────────────────────────────────────────────
// TODO: fetch from GET /admin/organisations/:id/answers/:answerId

type AnswerDetail = {
    id: string;
    orgId: number;
    orgName: string;
    queryId: string;
    question: string;
    price: number;
    paid: boolean;
    abstract: string;
    answer: string | null;       // null = not yet generated (should not happen for success queries)
    createdAt: string;
};

const MOCK_ANSWERS: Record<string, AnswerDetail> = {
    "ans-001": {
        id: "ans-001",
        orgId: 1, orgName: "smoke_test",
        queryId: "0bee7226-cc02-4ffd-8530-87056dee5e5c",
        question: "Tell me about the demographics of ford fans in the USA",
        price: 22, paid: false,
        createdAt: "2026-06-01T21:38:14.567850+00:00",
        abstract: "This analysis explores the demographic profile of Ford fans in the United States, focusing on age distribution, gender representation, income levels, and educational attainment. It highlights the predominance of older adults within the fan base, as well as the gender balance and varying income classifications. The educational background of fans is also examined, revealing insights into their qualifications. The time frame for the data encompasses recent trends up to October 2023.",
        answer: null,
    },
    "ans-002": {
        id: "ans-002",
        orgId: 1, orgName: "smoke_test",
        queryId: "166acacc-7bb1-46d7-bae2-78e1994773b9",
        question: "How do coke drinkers compare to average americans by age?",
        price: 22, paid: true,
        createdAt: "2026-06-01T17:06:32.283334+00:00",
        abstract: "This analysis compares Coca-Cola drinkers aged 21 and older to the average American population across age groups, examining representation and index scores.",
        answer: `Coca-Cola drinkers aged 21 and older show varied preferences compared to the average American by age.

- For the 18-24 age group, Coca-Cola drinkers represent 13.4% of this segment, significantly higher than the average (index 164.2).
- In the 25-34 age range, 18.2% of Coca-Cola drinkers are present, closely aligning with the average (index 97.6).
- The 35-44 age group has 17.8% of Coca-Cola drinkers, slightly above average (index 103.4).
- For those aged 45-54, Coca-Cola drinkers account for 16.2%, matching the average (index 97.5).
- The 55+ demographic shows a notable 34.4% of Coca-Cola drinkers, which is below average (index 87.4).

Overall, Coca-Cola drinkers aged 21+ are more prevalent in the younger age brackets (18-24) and slightly above average in the 35-44 range, while they are less represented in the older age groups (55+).`,
    },
    "ans-003": {
        id: "ans-003", orgId: 1, orgName: "smoke_test",
        queryId: "q-003", question: "Tell me about coke fans in US",
        price: 22, paid: true,
        createdAt: "2026-06-01T15:05:34.073134+00:00",
        abstract: "An overview of Coca-Cola fans in the United States, covering demographics, consumption patterns, and brand loyalty indicators.",
        answer: "Coca-Cola fans in the US skew slightly older, with strong representation in the 35-54 bracket. Brand loyalty is high, with 68% of self-identified fans purchasing at least once per week. Regional concentration is highest in the South and Midwest.",
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 shrink-0">
                {label}
            </span>
            <span className="text-sm text-foreground">{children}</span>
        </div>
    );
}

function PaidBadge({ paid }: { paid: boolean }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
            paid
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
        )}>
            {paid ? "Paid" : "Unpaid"}
        </span>
    );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-xl border border-border bg-card p-6 flex flex-col gap-4", className)}>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnswerDetailPage() {
    const { id, answerId } = useParams();

    // TODO: fetch from GET /admin/organisations/:id/answers/:answerId
    const answer = MOCK_ANSWERS[answerId as string];

    if (!answer) {
        return (
            <div className="p-8 max-w-[860px] mx-auto flex flex-col gap-4">
                <Link
                    href={`/admin/organisations/${id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to org
                </Link>
                <p className="text-sm text-muted-foreground">Answer not found.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[860px] mx-auto flex flex-col gap-6">

            {/* Back */}
            <Link
                href={`/admin/organisations/${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft size={14} strokeWidth={2} />
                {answer.orgName}
            </Link>

            {/* ── Meta card ── */}
            <SectionCard>
                <div className="flex items-start justify-between gap-4">
                    <h2 className="m-0 text-foreground leading-snug flex-1">
                        {answer.question}
                    </h2>
                    <PaidBadge paid={answer.paid} />
                </div>

                <div className="flex flex-col gap-2.5 pt-1 border-t border-border">
                    <MetaRow label="Org">
                        <Link
                            href={`/admin/organisations/${answer.orgId}`}
                            className="text-primary hover:underline"
                        >
                            {answer.orgName}
                        </Link>
                    </MetaRow>
                    <MetaRow label="Query ID">
                        <span className="font-mono text-xs text-muted-foreground">{answer.queryId}</span>
                    </MetaRow>
                    <MetaRow label="Price">
                        <span className="font-semibold tabular-nums">${answer.price} USD</span>
                    </MetaRow>
                    <MetaRow label="Created">
                        {formatDateTime(answer.createdAt)}
                    </MetaRow>
                </div>
            </SectionCard>

            {/* ── Abstract ── */}
            <SectionCard>
                <div className="flex flex-col gap-1">
                    <h4 className="m-0 text-foreground">Abstract</h4>
                    <p className="m-0 text-xs text-muted-foreground">
                        Shown to the user before payment to preview the answer.
                    </p>
                </div>
                <p className="m-0 text-sm text-foreground leading-relaxed">
                    {answer.abstract}
                </p>
            </SectionCard>

            {/* ── Full answer ── */}
            <SectionCard>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h4 className="m-0 text-foreground">Full answer</h4>
                        <p className="m-0 text-xs text-muted-foreground">
                            {answer.paid
                                ? "User has paid — full answer unlocked."
                                : "User has not paid — admin view only."}
                        </p>
                    </div>
                    {!answer.paid && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border bg-orange-50 text-orange-700 border-orange-200 shrink-0">
                            Not purchased
                        </span>
                    )}
                </div>

                {answer.answer ? (
                    <div className="rounded-lg bg-accent/50 border border-border p-4">
                        <p className="m-0 text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {answer.answer}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg bg-accent/50 border border-border px-4 py-8 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Full answer not available for this query.
                        </p>
                    </div>
                )}
            </SectionCard>

            {/* ── Downloads — only if paid ── */}
            {answer.paid && answer.answer && (
                <SectionCard>
                    <div className="flex flex-col gap-1">
                        <h4 className="m-0 text-foreground">Downloads</h4>
                        <p className="m-0 text-xs text-muted-foreground">
                            JSON includes full analysis metadata. CSV is a flat table (Country, Week, and data columns).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* TODO: wire to real download endpoints */}
                        <a
                            href={`/api/answers/${answer.id}/download?format=json`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                        >
                            <Download size={14} strokeWidth={1.8} />
                            Download JSON
                        </a>
                        <span className="text-border-3 text-xs">·</span>
                        <a
                            href={`/api/answers/${answer.id}/download?format=csv`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                        >
                            <Download size={14} strokeWidth={1.8} />
                            Download CSV
                        </a>
                    </div>
                </SectionCard>
            )}

        </div>
    );
}