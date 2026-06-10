"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Clock, CheckCircle } from "lucide-react";
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
    owner_kind: "member" | "org_automation";
    owner_username: string | null;
    created_at: string;
    paid_at: string | null;
};

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with GET /v1/answers/{answer_uuid}
// Returns AnswerPreviewResponse: { uuid, question, abstract, price, paid, answer? }
// ---------------------------------------------------------------------------

const MOCK_QUERIES: Record<string, QueryDetail> = {
    "ans_9a1b2c3d": {
        uuid: "ans_9a1b2c3d",
        question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?",
        abstract: "Analysis of 12,400 YouGov panellists aged 18–26 identifies price-performance ratio, sustainability credentials, and influencer endorsement as the top three purchase drivers, with regional variation between London and Northern England.",
        price: "12.50",
        paid: false,
        answer: null,
        owner_kind: "member",
        owner_username: "sarah.chen",
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        paid_at: null,
    },
    "ans_2m3n4o5p": {
        uuid: "ans_2m3n4o5p",
        question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.",
        abstract: "Afterpay leads unaided awareness at 84% among 25–34 year olds. Revolut shows strongest 12-month growth at +18pp. Traditional bank digital offerings lag on spontaneous recall.",
        price: "15.00",
        paid: true,
        answer: "Unaided brand awareness survey conducted across 3,800 Australians aged 25–34 in Q1 2025.\n\nAfterpay leads unaided awareness at 84%, reflecting its strong market incumbency and Australian origin story. Zip Co follows at 71%. Among international challengers, Revolut shows the most significant year-on-year growth, rising from 29% to 47% unaided awareness — a gain of 18 percentage points driven by aggressive digital acquisition and referral programmes.\n\nTraditional bank digital offerings (CommBank Neo, ANZ Plus, NAB Now) lag significantly on spontaneous recall despite substantial media investment, averaging 31% unaided awareness. Qualitative research suggests this is partly attributable to brand architecture confusion — consumers do not readily distinguish digital sub-brands from parent institutions.\n\nWise and Revolut score highest on 'feels like a fintech' perception (82% and 78% respectively), while Afterpay and Zip retain strongest 'trust' scores among the cohort.",
        owner_kind: "org_automation",
        owner_username: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 14 + 420000).toISOString(),
    },
    "ans_8i9j0k1l": {
        uuid: "ans_8i9j0k1l",
        question: "What percentage of US households earning over $100k use meal-kit delivery services?",
        abstract: "US Census and consumer panel data indicates 28.4% penetration among households earning $100k+, up from 19.1% in 2022. HelloFresh and Blue Apron hold combined 61% share of this segment.",
        price: "6.50",
        paid: true,
        answer: "Based on US Census microdata combined with a consumer panel of 8,200 respondents, 28.4% of US households with annual income exceeding $100,000 used meal-kit delivery services at least once in the past 12 months, up from 19.1% in 2022.\n\nHelloFresh leads with 34% market share in this income segment, followed by Blue Apron at 27%. Together they account for 61% of the addressable market. Home Chef and Green Chef show the strongest growth trajectories, each gaining approximately 3–4 percentage points of share year-over-year.\n\nKey drivers of adoption in this income bracket include time scarcity (cited by 67% of subscribers), meal variety (52%), and reduced food waste (44%). Price sensitivity is notably lower than the general population — only 18% cited cost as a primary consideration versus 41% in lower income brackets.",
        owner_kind: "member",
        owner_username: "sarah.chen",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 300000).toISOString(),
    },
    "ans_7u8v9w0x": {
        uuid: "ans_7u8v9w0x",
        question: "What are current consumer attitudes toward luxury resale platforms in Western Europe?",
        abstract: "67% of luxury consumers in France, Germany and the UK view authenticated resale positively, up from 44% in 2021. Vestiaire Collective and Vinted lead aided awareness. Environmental motivation has overtaken value-seeking as primary driver.",
        price: "22.00",
        paid: false,
        answer: null,
        owner_kind: "member",
        owner_username: "james.whitfield",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        paid_at: null,
    },
    "ans_3k4l5m6n": {
        uuid: "ans_3k4l5m6n",
        question: "Consumer willingness to pay premium for sustainable FMCG packaging in the UK.",
        abstract: "42% of UK consumers indicate willingness to pay 10–15% premium for verified sustainable packaging. Willingness drops sharply above 20% premium. Category matters: household cleaning leads at 51%, confectionery trails at 28%.",
        price: "10.00",
        paid: true,
        answer: "Consumer attitudes survey across 5,400 UK adults on sustainable packaging willingness-to-pay, conducted Q1 2025.\n\n42% of UK consumers indicate willingness to pay a 10–15% premium for FMCG products in verified sustainable packaging, up from 34% in 2022. Willingness drops sharply above the 20% threshold: only 11% would pay a 20–30% premium, and just 4% would pay more than 30%.\n\nCategory variation is significant. Household cleaning leads willingness at 51%, followed by personal care at 46%, and ambient grocery at 38%. Confectionery trails at 28%, suggesting hedonic categories face a higher barrier to sustainability premiums.\n\nAge and income are strong moderators: consumers aged 25–40 and those in AB socioeconomic grades show approximately 12–15 percentage points higher willingness than the general population.",
        owner_kind: "member",
        owner_username: "priya.nair",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 72 + 360000).toISOString(),
    },
};

// Current user — TODO: replace with auth session
const CURRENT_USERNAME = "sarah.chen";

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

    // TODO: replace with GET /v1/answers/{answer_uuid}
    const mock = MOCK_QUERIES[uuid];

    const [paid, setPaid] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    if (!initialized && mock) {
        setPaid(mock.paid);
        setAnswer(mock.answer);
        setInitialized(true);
    }

    // Is this query owned by the current user?
    const isOwner =
        mock?.owner_kind === "member" &&
        mock?.owner_username === CURRENT_USERNAME;

    async function handleApprove() {
        setApproving(true);
        // TODO: POST /v2/orgs/{org_id}/answers/{answer_uuid}/approve
        // Returns AnswerApproveResponse: { uuid, paid, charged_now, answer }
        await new Promise((r) => setTimeout(r, 900));
        setAnswer("This is the full synthesised answer body, unlocked after approval. In production this comes from AnswerApproveResponse.answer.");
        setPaid(true);
        setApproving(false);
    }

    if (!mock) {
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
                    <h1 className="text-xl font-semibold leading-snug">{mock.question}</h1>
                </div>
                <div className="text-2xl font-semibold tabular-nums sm:shrink-0">
                    {formatCurrency(mock.price)}
                </div>
            </div>

            {/* ── Meta ─────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-card border p-4">
                <MetaItem icon={User} label="Submitted by">
                    {mock.owner_kind === "org_automation" ? (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            API key
                        </Badge>
                    ) : (
                        <span>{mock.owner_username}</span>
                    )}
                </MetaItem>
                <MetaItem icon={Clock} label="Submitted">
                    {formatDate(mock.created_at)}
                </MetaItem>
                {paid && mock.paid_at && (
                    <MetaItem icon={CheckCircle} label="Approved">
                        {formatDate(mock.paid_at)}
                    </MetaItem>
                )}
            </div>

            {/* ── Abstract — only shown before approval ── */}
            {!paid && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold">Abstract</h2>
                    <div className="bg-card border p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {mock.abstract}
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
            ) : !paid && isOwner ? (
                <div className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4",
                    "border-warning/30 bg-warning/5"
                )}>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">Ready to approve</p>
                        <p className="text-xs text-muted-foreground">
                            Approving will charge {formatCurrency(mock.price)} to your organisation's balance and unlock the full answer.
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
            ) : !paid && !isOwner ? (
                <div className="bg-card border p-4 text-sm text-muted-foreground">
                    Waiting for approval by {mock.owner_username ?? "the submitter"}.
                </div>
            ) : null}

        </div>
    );
}