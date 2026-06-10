"use client";

import { use, useState } from "react";
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
// Mock data — keyed by uuid
// TODO: replace with GET /v1/answers/{answer_uuid}
// AnswerPreviewResponse: { uuid, abstract, price, paid, question, answer? }
// Org + owner context comes from query params until endpoint is updated
// ---------------------------------------------------------------------------

const MOCK_DETAIL: Record<string, Partial<QueryDetail>> = {
    "ans_9a1b2c3d": {
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        paid_at: null,
        answer: null,
    },
    "ans_4e5f6g7h": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        paid_at: null,
        answer: null,
    },
    "ans_8i9j0k1l": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 8 + 300000).toISOString(),
        answer: "Based on US Census microdata combined with a consumer panel of 8,200 respondents, 28.4% of US households with annual income exceeding $100,000 used meal-kit delivery services at least once in the past 12 months, up from 19.1% in 2022.\n\nHelloFresh leads with 34% market share in this income segment, followed by Blue Apron at 27%. Together they account for 61% of the addressable market. Home Chef and Green Chef show the strongest growth trajectories, each gaining approximately 3–4 percentage points of share year-over-year.\n\nKey drivers of adoption in this income bracket include time scarcity (cited by 67% of subscribers), meal variety (52%), and reduced food waste (44%). Price sensitivity is notably lower than the general population — only 18% cited cost as a primary consideration versus 41% in lower income brackets.\n\nChurn remains elevated at approximately 35% annually, with 'lack of flexibility' and 'packaging waste' as the top-cited reasons for cancellation.",
    },
    "ans_2m3n4o5p": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 14 + 420000).toISOString(),
        answer: "Unaided brand awareness survey conducted across 3,800 Australians aged 25–34 in Q1 2025.\n\nAfterpay leads unaided awareness at 84%, reflecting its strong market incumbency and Australian origin story. Zip Co follows at 71%. Among international challengers, Revolut shows the most significant year-on-year growth, rising from 29% to 47% unaided awareness — a gain of 18 percentage points driven by aggressive digital acquisition and referral programmes.\n\nTraditional bank digital offerings (CommBank Neo, ANZ Plus, NAB Now) lag significantly on spontaneous recall despite substantial media investment, averaging 31% unaided awareness. Qualitative research suggests this is partly attributable to brand architecture confusion — consumers do not readily distinguish digital sub-brands from parent institutions.\n\nWise and Revolut score highest on 'feels like a fintech' perception (82% and 78% respectively), while Afterpay and Zip retain strongest 'trust' scores among the cohort.",
    },
    "ans_3q4r5s6t": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 480000).toISOString(),
        answer: "Longitudinal brand tracker data covering 6,200 US women aged 21–35 across Q1 2022 and Q1 2025.\n\nPositive brand perception of Guinness among this cohort has grown from 31% to 49% over the three-year period, representing an 18-percentage-point increase. This trajectory closely correlates with the launch and sustained investment in the 'Belong' campaign beginning Q3 2022.\n\nOccasion-based associations have shifted materially: 'pub or bar' as the primary consumption occasion has declined from 61% to 44% of positive associations, while 'social dining' has risen from 19% to 38%. 'Celebrations and events' has also grown from 14% to 24%.\n\nConsideration among non-drinkers and low-frequency drinkers has improved, with 'I would try it at a restaurant' rising from 22% to 41%. This suggests the campaign has successfully broadened the brand's perceived occasions beyond traditional on-trade settings.",
    },
    "ans_7u8v9w0x": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        paid_at: null,
        answer: null,
    },
    "ans_1y2z3a4b": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 36 + 240000).toISOString(),
        answer: "Subscriber loyalty survey conducted across 4,100 premium streaming subscribers in Denmark, Sweden, Norway and Finland in Q1 2025.\n\nSpotify retains 78% of premium subscribers on an annual basis in the Nordic region, compared to Apple Music at 61%. The 17-percentage-point gap has widened from 11 points in 2023.\n\nThe podcast ecosystem is the single strongest retention driver for Spotify, cited by 71% of retained subscribers as a key reason for not switching. Nordic-language podcast content is particularly cited, with local true crime and interview formats performing strongly.\n\nApple Music loyalty correlates heavily with Apple device ownership — 89% of retained Apple Music subscribers own three or more Apple devices. Among subscribers who own one or no Apple devices, Apple Music retention drops to 34%. This suggests Apple Music's Nordic retention is largely ecosystem-driven rather than product-driven.\n\nTidal retains a small but highly loyal base (94% annual retention among subscribers), concentrated among audiophile and professional musician segments.",
    },
    "ans_5c6d7e8f": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 48 + 420000).toISOString(),
        answer: "Brand trust survey among 2,900 UK consumers self-identifying as Asian or of Asian heritage, conducted Q1 2025.\n\nL'Oréal leads overall skincare brand trust at 58% among this cohort, compared to Estée Lauder at 51%. However, the picture is more nuanced at the sub-attribute level.\n\nEstée Lauder scores 14 percentage points higher than L'Oréal on 'perceived premium quality' (74% vs 60%) and 9 points higher on 'cultural relevance' (48% vs 39%). The cultural relevance gap is most pronounced among respondents of East Asian heritage, where Estée Lauder scores 61% versus L'Oréal's 37%.\n\nL'Oréal's overall trust lead is driven by accessibility and familiarity: it scores 22 points higher on 'available where I shop' and 18 points higher on 'value for money'. Among respondents aged 18–30, the trust gap narrows to 3 points (L'Oréal 54%, Estée Lauder 51%), suggesting generational convergence.",
    },
    "ans_9g0h1i2j": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
        paid_at: null,
        answer: null,
    },
    "ans_3k4l5m6n": {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        paid_at: new Date(Date.now() - 1000 * 60 * 60 * 72 + 360000).toISOString(),
        answer: "Consumer attitudes survey across 5,400 UK adults on sustainable packaging willingness-to-pay, conducted Q1 2025.\n\n42% of UK consumers indicate willingness to pay a 10–15% premium for FMCG products in verified sustainable packaging, up from 34% in 2022. Willingness drops sharply above the 20% threshold: only 11% would pay a 20–30% premium, and just 4% would pay more than 30%.\n\nCategory variation is significant. Household cleaning leads willingness at 51%, followed by personal care at 46%, and ambient grocery at 38%. Confectionery trails at 28%, suggesting hedonic categories face a higher barrier to sustainability premiums.\n\nAge and income are strong moderators: consumers aged 25–40 and those in AB socioeconomic grades show approximately 12–15 percentage points higher willingness than the general population. However, stated willingness consistently overstates actual purchasing behaviour by an estimated 30–40% based on panel purchasing data cross-reference.",
    },
};

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


    // useState must be declared before any params-dependent logic
    const [paid, setPaid] = useState<boolean>(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Context from query params — passed by the list page
    // TODO: remove once GET /v1/answers/{uuid} includes org + owner fields
    const orgId = searchParams.get("org_id") ?? "";
    const orgName = searchParams.get("org_name") ?? "Unknown organisation";
    const ownerKind = (searchParams.get("owner_kind") ?? "member") as "member" | "org_automation";
    const ownerName = searchParams.get("owner") ?? null;

    // Check if current admin is a member of this org
    // TODO: replace with real session membership check
    // GET /v2/orgs → check if org_id is in user's memberships
    const ADMIN_MEMBERSHIPS = [1, 8, 5]; // matches MOCK_MEMBERSHIPS org_ids
    const isMemberOfOrg = orgId ? ADMIN_MEMBERSHIPS.includes(parseInt(orgId)) : false;

    // Mock — TODO: replace with GET /v1/answers/{answer_uuid}
    // Returns AnswerPreviewResponse: { uuid, question, abstract, price, paid, answer? }
    const mock = MOCK_DETAIL[params.uuid];

    // Seed state from mock on first render
    if (!initialized && mock) {
        setPaid(mock.paid_at !== null);
        setAnswer(mock.answer ?? null);
        setInitialized(true);
    }

    // Derive from mock — in production comes directly from GET /v1/answers/{uuid}
    const question = getField(params.uuid, "question");
    const abstract = getField(params.uuid, "abstract");
    const price = getField(params.uuid, "price");
    const createdAt = mock?.created_at ?? "";
    const paidAt = mock?.paid_at ?? null;

    async function handleApprove() {
        setApproving(true);
        // TODO: POST /v2/orgs/{org_id}/answers/{answer_uuid}/approve
        // (requires admin to be a member of the org)
        // Returns AnswerApproveResponse: { uuid, paid, charged_now, answer }
        await new Promise((r) => setTimeout(r, 900));
        // Simulate response
        setAnswer("This is the full synthesised answer body that is unlocked after approval and payment. In production this comes from AnswerApproveResponse.answer.");
        setPaid(true);
        setApproving(false);
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
                {paid && paidAt && (
                    <MetaItem icon={CheckCircle} label="Approved">
                        {formatDate(paidAt)}
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

// ---------------------------------------------------------------------------
// Helper to pull fields from the shared mock list
// In production all fields come directly from GET /v1/answers/{uuid}
// ---------------------------------------------------------------------------

function getField(uuid: string, field: "question" | "abstract" | "price"): string {
    // Dynamically import would cause issues — inline the lookup
    const map: Record<string, Record<string, string>> = {
        "ans_9a1b2c3d": { question: "What are the top purchase drivers for Gen Z consumers in the UK sportswear market?", abstract: "Analysis of 12,400 YouGov panellists aged 18–26 identifies price-performance ratio, sustainability credentials, and influencer endorsement as the top three purchase drivers, with regional variation between London and Northern England.", price: "12.50" },
        "ans_4e5f6g7h": { question: "How does Reddit sentiment on EV brands compare to X sentiment in Q1 2025?", abstract: "Reddit shows 34% higher positive sentiment toward EV brands vs X, driven by r/electricvehicles community engagement. Tesla leads on both platforms; BYD shows strongest growth trajectory on Reddit.", price: "8.00" },
        "ans_8i9j0k1l": { question: "What percentage of US households earning over $100k use meal-kit delivery services?", abstract: "US Census and consumer panel data indicates 28.4% penetration among households earning $100k+, up from 19.1% in 2022. HelloFresh and Blue Apron hold combined 61% share of this segment.", price: "6.50" },
        "ans_2m3n4o5p": { question: "Brand awareness scores for challenger fintech brands among 25–34 year olds in Australia.", abstract: "Afterpay leads unaided awareness at 84% among 25–34 year olds. Revolut shows strongest 12-month growth at +18pp. Traditional bank digital offerings lag on spontaneous recall.", price: "15.00" },
        "ans_3q4r5s6t": { question: "How has Diageo's Guinness brand perception shifted among women aged 21–35 in the US since 2022?", abstract: "Positive brand perception among US women 21–35 has grown from 31% to 49% since 2022, correlating with the 'Belong' campaign. Occasion-based associations have shifted from pub-only to social dining.", price: "18.00" },
        "ans_7u8v9w0x": { question: "What are current consumer attitudes toward luxury resale platforms in Western Europe?", abstract: "67% of luxury consumers in France, Germany and the UK view authenticated resale positively, up from 44% in 2021. Vestiaire Collective and Vinted lead aided awareness. Environmental motivation has overtaken value-seeking as primary driver.", price: "22.00" },
        "ans_1y2z3a4b": { question: "Spotify vs Apple Music brand loyalty metrics among premium subscribers in the Nordics.", abstract: "Spotify retains 78% annual subscriber loyalty in the Nordics vs Apple Music at 61%. Podcast ecosystem cited as primary retention driver for Spotify; Apple Music loyalty correlates strongly with Apple device ownership.", price: "9.50" },
        "ans_5c6d7e8f": { question: "How do L'Oréal and Estée Lauder compare on skincare brand trust among Asian consumers in the UK?", abstract: "L'Oréal leads overall skincare trust at 58% vs Estée Lauder at 51% among UK Asian consumers. However, Estée Lauder scores 14pp higher on perceived premium quality and 9pp higher on cultural relevance.", price: "14.00" },
        "ans_9g0h1i2j": { question: "What is the share of voice for Heineken versus craft beer brands on social media in Germany?", abstract: "Heineken holds 22% share of voice in German beer social conversations, trailing craft collective brands at 31% combined. Instagram and TikTok skew strongly toward craft; Heineken leads on X and YouTube.", price: "11.00" },
        "ans_3k4l5m6n": { question: "Consumer willingness to pay premium for sustainable FMCG packaging in the UK.", abstract: "42% of UK consumers indicate willingness to pay 10–15% premium for verified sustainable packaging. Willingness drops sharply above 20% premium. Category matters: household cleaning leads at 51%, confectionery trails at 28%.", price: "10.00" },
    };
    return map[uuid]?.[field] ?? "";
}