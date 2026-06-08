"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
    "Brand awareness among 18–35 year olds",
    "Consumer sentiment toward our category",
    "Top purchase drivers this quarter",
    "Market share vs key competitors",
    "Competitor brand perception",
    "Demographic profile of our buyers",
    "Social media sentiment analysis",
    "Campaign effectiveness metrics",
    "Category growth trends",
    "Customer loyalty drivers",
];

// ---------------------------------------------------------------------------
// Mock recent queries
// TODO: replace with GET /v2/orgs/{org_id}/members/me/answers
// ---------------------------------------------------------------------------

const MOCK_RECENT = [
    {
        uuid: "ans_2m3n4o5p",
        question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.",
        paid: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    },
    {
        uuid: "ans_8i9j0k1l",
        question: "What percentage of US households earning over $100k use meal-kit delivery services?",
        paid: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        uuid: "ans_9a1b2c3d",
        question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?",
        paid: false,
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueryState =
    | { step: "input" }
    | { step: "loading" }
    | { step: "quote"; uuid: string; abstract: string; price: string; question: string }
    | { step: "no_data"; message: string }
    | { step: "approving" }
    | { step: "error"; message: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgQueryPage({
    params: paramsPromise,
}: {
    params: Promise<{ org_id: string }>;
}) {
    const { org_id } = use(paramsPromise);
    const router = useRouter();

    const [question, setQuestion] = useState("");
    const [state, setState] = useState<QueryState>({ step: "input" });

    async function handleSubmit(q?: string) {
        const text = q ?? question;
        if (!text.trim()) return;
        setState({ step: "loading" });
        // TODO: POST /v2/orgs/{org_id}/query
        // body: QueryBody { question: string }
        // returns: QueryResponse { message, no_data, paywalled, uuid, abstract, price, links }
        await new Promise((r) => setTimeout(r, 1200));
        setState({
            step: "quote",
            uuid: "ans_9a1b2c3d",
            question: text,
            abstract: "Analysis of 12,400 YouGov panellists aged 18–26 identifies price-performance ratio, sustainability credentials, and influencer endorsement as the top three purchase drivers, with regional variation between London and Northern England.",
            price: "12.50",
        });
    }

    async function handleApprove() {
        if (state.step !== "quote") return;
        const { uuid } = state;
        setState({ step: "approving" });
        // TODO: POST /v2/orgs/{org_id}/answers/{uuid}/approve
        await new Promise((r) => setTimeout(r, 900));
        router.push(`/organisations/${org_id}/queries/${uuid}`);
    }

    function handleDismiss() {
        setState({ step: "input" });
    }

    function handleSuggestion(s: string) {
        setQuestion(s);
        handleSubmit(s);
    }

    const isLoading = state.step === "loading" || state.step === "approving";
    const showInput = state.step === "input" || state.step === "loading";

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Query</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Ask a question across premium data providers. You'll see a price quote before any charge is made.
                </p>
            </div>

            {/* ── Two column layout ────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── Left — main query area (takes priority) ───────────────────── */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                    {/* Input */}
                    {showInput && (
                        <>
                            <div className="bg-card border focus-within:ring-2 focus-within:ring-ring transition-shadow">
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                                    }}
                                    placeholder="Ask a question about your consumers, market, or competitors…"
                                    disabled={isLoading}
                                    rows={5}
                                    className="w-full px-4 pt-4 pb-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-none disabled:opacity-50"
                                />
                                <div className="flex items-center justify-between px-4 pb-3">
                                    <span className="text-xs text-muted-foreground">
                                        {question.length > 0 ? `${question.length} characters` : "⌘ + Enter to submit"}
                                    </span>
                                    <Button
                                        onClick={() => handleSubmit()}
                                        disabled={!question.trim() || isLoading}
                                        size="sm"
                                        className="h-8 text-xs"
                                    >
                                        {isLoading ? "Searching…" : "Submit query"}
                                    </Button>
                                </div>
                            </div>

                            {/* Suggestions */}
                            {!isLoading && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-muted-foreground">Suggested queries</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTIONS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleSuggestion(s)}
                                                className="text-xs px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-border-3 transition-colors text-left"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Loading */}
                    {state.step === "loading" && (
                        <div className="bg-card border p-8 flex flex-col items-center gap-3 text-center">
                            <Loader size={18} className="animate-adxc-spin text-muted-foreground" />
                            <p className="text-sm font-medium">Searching across data providers…</p>
                            <p className="text-xs text-muted-foreground">
                                Querying YouGov, Reddit, X, US Census and more.
                            </p>
                        </div>
                    )}

                    {/* Quote */}
                    {(state.step === "quote" || state.step === "approving") && (
                        <div className="flex flex-col gap-4">
                            {/* Question recap */}
                            <div className="flex items-start justify-between gap-3 bg-muted/40 border p-4">
                                <p className="text-sm text-foreground flex-1">
                                    {(state as { question: string }).question}
                                </p>
                                {state.step === "quote" && (
                                    <button
                                        onClick={handleDismiss}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 leading-none"
                                        aria-label="Dismiss"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {/* Abstract */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold">Abstract</h2>
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                        Preview
                                    </Badge>
                                </div>
                                <div className="bg-card border p-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {(state as { abstract: string }).abstract}
                                    </p>
                                </div>
                            </div>

                            {/* Approve CTA */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary/20 bg-primary/5 p-4">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium">
                                        Full answer available for{" "}
                                        <span className="text-primary font-semibold">
                                            {formatCurrency((state as { price: string }).price)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Charged to your organisation's balance. Full answer unlocked immediately.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDismiss}
                                        disabled={state.step === "approving"}
                                        className="h-8 text-xs"
                                    >
                                        Dismiss
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={state.step === "approving"}
                                        size="sm"
                                        className="h-8 text-xs"
                                    >
                                        {state.step === "approving" ? "Approving…" : "Approve & pay"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No data */}
                    {state.step === "no_data" && (
                        <div className="bg-card border p-8 flex flex-col items-center gap-3 text-center">
                            <p className="text-sm font-medium">No data found</p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                {state.message || "No providers had relevant data for this query. Try rephrasing or broadening your question."}
                            </p>
                            <Button variant="outline" size="sm" onClick={handleDismiss} className="mt-1">
                                Try again
                            </Button>
                        </div>
                    )}

                    {/* Error */}
                    {state.step === "error" && (
                        <div className="border border-destructive/30 bg-card p-6 flex flex-col items-center gap-2 text-center">
                            <p className="text-sm font-medium text-destructive-text">Something went wrong</p>
                            <p className="text-xs text-muted-foreground">{state.message}</p>
                            <Button variant="outline" size="sm" onClick={handleDismiss} className="mt-1">
                                Try again
                            </Button>
                        </div>
                    )}

                </div>

                {/* ── Right — recent queries (contextual, secondary) ────────────── */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Recent queries
                        </p>
                        <Link
                            href={`/organisations/${org_id}/queries`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        {MOCK_RECENT.map((q) => (
                            <Link
                                key={q.uuid}
                                href={`/organisations/${org_id}/queries/${q.uuid}`}
                                className="group bg-card border p-3 flex flex-col gap-1.5 hover:border-border-3 transition-colors"
                            >
                                <p className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {q.question}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {timeAgo(q.created_at)}
                                    </span>
                                    <span className={`text-xs font-medium ${q.paid ? "text-success" : "text-warning"}`}>
                                        {q.paid ? "Approved" : "Pending"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}