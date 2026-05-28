"use client";

import { useState } from "react";
import {
    ArrowUpRight,
    Download,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Activity,
    ChevronDown,
    Plus,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET  /v2/orgs/{org_id}/balance              → OrgBalanceResponse
// GET  /v2/orgs/{org_id}/ledger               → LedgerResponse (paginated)
// GET  /v2/orgs/{org_id}/invoices             → InvoiceListResponse
// GET  /v2/orgs/{org_id}/payment-method       → PaymentMethodResponse
// POST /v2/orgs/{org_id}/topup                → TopUpResponse
// POST /v2/orgs/{org_id}/payment-method       → PaymentMethodResponse

const MOCK_BALANCE = {
    amount: "372.50",
    currency: "USD",
    low_threshold: 50,
};

const MOCK_MONTHLY_SPEND = [
    { month: "Nov", spend: 88.4 },
    { month: "Dec", spend: 142.2 },
    { month: "Jan", spend: 97.0 },
    { month: "Feb", spend: 176.5 },
    { month: "Mar", spend: 159.8 },
    { month: "Apr", spend: 203.8 },
    { month: "May", spend: 127.5 },
];

const MOCK_LEDGER = [
    {
        id: "ldg_001",
        type: "topup",
        description: "Credit top-up",
        ref: "TXN-8821",
        amount: "+$200.00",
        balance_after: "$372.50",
        ts: "27 May 2026, 09:14",
        status: "completed",
    },
    {
        id: "ldg_002",
        type: "query",
        description: "Query — YouGov + Reddit",
        ref: "QRY-4492",
        amount: "-$8.20",
        balance_after: "$172.50",
        ts: "27 May 2026, 08:51",
        status: "completed",
    },
    {
        id: "ldg_003",
        type: "query",
        description: "Query — US Census",
        ref: "QRY-4491",
        amount: "-$3.10",
        balance_after: "$180.70",
        ts: "26 May 2026, 16:33",
        status: "completed",
    },
    {
        id: "ldg_004",
        type: "query",
        description: "Query — X + QUID",
        ref: "QRY-4488",
        amount: "-$11.40",
        balance_after: "$183.80",
        ts: "26 May 2026, 11:02",
        status: "completed",
    },
    {
        id: "ldg_005",
        type: "query",
        description: "Query — YouGov",
        ref: "QRY-4471",
        amount: "-$4.80",
        balance_after: "$195.20",
        ts: "24 May 2026, 14:20",
        status: "completed",
    },
    {
        id: "ldg_006",
        type: "topup",
        description: "Credit top-up",
        ref: "TXN-8790",
        amount: "+$500.00",
        balance_after: "$200.00",
        ts: "12 May 2026, 10:00",
        status: "completed",
    },
    {
        id: "ldg_007",
        type: "query",
        description: "Query — Reddit + QUID",
        ref: "QRY-4440",
        amount: "-$9.60",
        balance_after: "-",
        ts: "10 May 2026, 09:45",
        status: "completed",
    },
    {
        id: "ldg_008",
        type: "query",
        description: "Query — YouGov + US Census + X",
        ref: "QRY-4431",
        amount: "-$18.50",
        balance_after: "-",
        ts: "8 May 2026, 13:10",
        status: "completed",
    },
];

const MOCK_INVOICES = [
    { id: "inv_001", label: "April 2026", amount: "$203.80", status: "paid", url: "#" },
    { id: "inv_002", label: "March 2026", amount: "$159.80", status: "paid", url: "#" },
    { id: "inv_003", label: "February 2026", amount: "$176.50", status: "paid", url: "#" },
    { id: "inv_004", label: "January 2026", amount: "$97.00", status: "paid", url: "#" },
];

const MOCK_PAYMENT_METHOD = {
    brand: "Visa",
    last4: "4242",
    expiry: "08/27",
};

const TOP_UP_PRESETS = [100, 250, 500, 1000];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number) {
    const n = typeof value === "string" ? parseFloat(value) : value;
    return `$${n.toFixed(2)}`;
}

// ─── Spend chart (pure CSS / SVG — no charting lib dependency) ────────────────

function SpendChart({ data }: { data: { month: string; spend: number }[] }) {
    const max = Math.max(...data.map((d) => d.spend));
    const currentMonth = data[data.length - 1];

    return (
        <div className="flex items-end gap-2 h-24 w-full">
            {data.map((d, i) => {
                const isCurrent = i === data.length - 1;
                const heightPct = Math.round((d.spend / max) * 100);
                return (
                    <div
                        key={d.month}
                        className="flex flex-col items-center gap-1.5 flex-1"
                    >
                        <div className="w-full flex flex-col justify-end" style={{ height: "72px" }}>
                            <div
                                className={`w-full rounded-xs transition-all ${isCurrent
                                        ? "bg-primary"
                                        : "bg-muted-foreground/20"
                                    }`}
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                        <span
                            className={`text-xs ${isCurrent
                                    ? "text-foreground font-semibold"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {d.month}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Ledger row ───────────────────────────────────────────────────────────────

function LedgerRow({
    item,
    isLast,
}: {
    item: (typeof MOCK_LEDGER)[number];
    isLast: boolean;
}) {
    const isTopup = item.type === "topup";
    return (
        <div
            className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center py-3 ${!isLast ? "border-b border-border" : ""
                }`}
        >
            {/* Icon */}
            <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isTopup
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-brand-50 text-brand-600"
                    }`}
            >
                {isTopup ? <CreditCard size={13} /> : <Activity size={13} />}
            </div>

            {/* Description */}
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {item.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">
                        {item.ref}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {item.ts}
                    </span>
                </div>
            </div>

            {/* Amount + status */}
            <div className="text-right shrink-0">
                <p
                    className={`text-sm font-semibold tabular-nums ${isTopup ? "text-emerald-700" : "text-foreground"
                        }`}
                >
                    {item.amount}
                </p>
                {item.balance_after !== "-" && (
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        bal. {item.balance_after}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
    const [topUpOpen, setTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("250");
    const [ledgerFilter, setLedgerFilter] = useState("all");

    const balance = parseFloat(MOCK_BALANCE.amount);
    const isLowBalance = balance < MOCK_BALANCE.low_threshold;

    const filteredLedger =
        ledgerFilter === "all"
            ? MOCK_LEDGER
            : MOCK_LEDGER.filter((r) => r.type === ledgerFilter);

    // Totals for current month summary
    const thisMonthTopUps = MOCK_LEDGER.filter(
        (r) => r.type === "topup" && r.ts.includes("May 2026")
    ).reduce((sum, r) => sum + parseFloat(r.amount.replace(/[^0-9.]/g, "")), 0);

    const thisMonthQueries = MOCK_LEDGER.filter(
        (r) => r.type === "query" && r.ts.includes("May 2026")
    ).length;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">
                        DEPT
                    </p>
                    <h2>Billing</h2>
                </div>
                <Button
                    className="shrink-0"
                    onClick={() => setTopUpOpen(true)}
                >
                    <Plus size={15} className="mr-1.5" />
                    Top up credits
                </Button>
            </div>

            {/* ── Low balance alert ── */}
            {isLowBalance && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                    <AlertTriangle size={15} className="text-orange-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-orange-800">
                            Balance is low
                        </p>
                        <p className="text-xs text-orange-700 mt-0.5">
                            Your account has {formatCurrency(MOCK_BALANCE.amount)} remaining.
                            Top up to ensure queries can continue without interruption.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => setTopUpOpen(true)}
                    >
                        Top up now
                    </Button>
                </div>
            )}

            {/* ── Balance + spend overview ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Balance hero */}
                <Card className="bg-brand-600 border-brand-600 text-white md:col-span-1">
                    <CardContent className="pt-6 pb-6 flex flex-col gap-1">
                        <p className="text-sm text-brand-200 font-medium">
                            Current balance
                        </p>
                        <p className="text-[36px] font-bold tracking-[-0.03em] leading-none text-white">
                            {formatCurrency(MOCK_BALANCE.amount)}
                        </p>
                        <p className="text-xs text-brand-300 mt-1">
                            Available for data purchases
                        </p>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="mt-4 self-start bg-white text-brand-600 hover:bg-brand-50 font-semibold text-xs"
                            onClick={() => setTopUpOpen(true)}
                        >
                            <Plus size={12} className="mr-1" />
                            Add credits
                        </Button>
                    </CardContent>
                </Card>

                {/* Monthly spend chart */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">
                                Monthly spend
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                6-month view
                            </p>
                        </div>
                        <CardDescription>
                            ${MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1].spend.toFixed(2)} spent in May 2026 ·{" "}
                            <span className="text-emerald-700 font-medium">
                                −37% vs April
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendChart data={MOCK_MONTHLY_SPEND} />
                    </CardContent>
                </Card>
            </div>

            {/* ── This month summary row ── */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Spent in May
                        </p>
                        <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                            $127.50
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            of $500.00 limit
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Queries run
                        </p>
                        <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                            {thisMonthQueries}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            approved this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <p className="text-xs text-muted-foreground font-medium tracking-wide mb-1">
                            Topped up
                        </p>
                        <p className="text-xl font-bold tracking-[-0.02em] text-foreground">
                            {formatCurrency(thisMonthTopUps)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            added in May
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Full ledger ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Transaction history
                    </p>
                    <Select
                        value={ledgerFilter}
                        onValueChange={setLedgerFilter}
                    >
                        <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All transactions</SelectItem>
                            <SelectItem value="topup">Top-ups only</SelectItem>
                            <SelectItem value="query">Queries only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* TODO: wire up GET /v2/orgs/{org_id}/ledger?type={filter}&page={page} */}
                <Card>
                    <CardContent className="pt-1 pb-1 px-5">
                        {filteredLedger.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">
                                No transactions match this filter.
                            </p>
                        ) : (
                            filteredLedger.map((item, i) => (
                                <LedgerRow
                                    key={item.id}
                                    item={item}
                                    isLast={i === filteredLedger.length - 1}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* TODO: paginate with GET /v2/orgs/{org_id}/ledger?cursor={next_cursor} */}
                <Button variant="outline" className="self-center text-xs h-8 px-4">
                    Load more
                    <ChevronDown size={13} className="ml-1.5" />
                </Button>
            </div>

            <Separator />

            {/* ── Invoices + payment method ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Invoices */}
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Invoices
                    </p>
                    {/* TODO: wire up GET /v2/orgs/{org_id}/invoices */}
                    <Card>
                        <CardContent className="pt-1 pb-1 px-5">
                            {MOCK_INVOICES.map((inv, i) => (
                                <div
                                    key={inv.id}
                                    className={`flex items-center justify-between py-3 ${i !== MOCK_INVOICES.length - 1
                                            ? "border-b border-border"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            size={14}
                                            className="text-emerald-600 shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {inv.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {inv.amount}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                                        asChild
                                    >
                                        <a href={inv.url} download>
                                            <Download size={12} className="mr-1" />
                                            PDF
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Payment method */}
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                        Payment method
                    </p>
                    {/* TODO: wire up GET /v2/orgs/{org_id}/payment-method */}
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 rounded border border-border bg-muted flex items-center justify-center">
                                        <CreditCard size={14} className="text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {MOCK_PAYMENT_METHOD.brand} ···· {MOCK_PAYMENT_METHOD.last4}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Expires {MOCK_PAYMENT_METHOD.expiry}
                                        </p>
                                    </div>
                                </div>
                                {/* TODO: wire up Stripe payment method update flow */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                >
                                    Update
                                    <ArrowUpRight size={12} className="ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Auto top-up nudge */}
                    <Card className="border-dashed">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-sm font-medium text-foreground mb-0.5">
                                Auto top-up
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Automatically add credits when your balance drops below a
                                threshold. Never block a live query.
                            </p>
                            {/* TODO: wire up POST /v2/orgs/{org_id}/auto-topup */}
                            <Button variant="outline" size="sm" className="text-xs h-8">
                                Configure auto top-up
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Top-up dialog ── */}
            <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add credits</DialogTitle>
                        <DialogDescription>
                            Credits are charged immediately to your saved payment method.
                            Current balance: {formatCurrency(MOCK_BALANCE.amount)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-5 py-2">
                        {/* Preset amounts */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Quick amounts
                            </Label>
                            <div className="grid grid-cols-4 gap-2">
                                {TOP_UP_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setTopUpAmount(preset.toString())}
                                        className={`h-9 rounded-xs text-sm font-medium border transition-colors ${topUpAmount === preset.toString()
                                                ? "border-primary bg-brand-50 text-primary"
                                                : "border-border bg-background text-foreground hover:border-primary/50"
                                            }`}
                                    >
                                        ${preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom amount */}
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="custom-amount"
                                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                            >
                                Custom amount
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="custom-amount"
                                    type="number"
                                    min="10"
                                    step="10"
                                    className="pl-7"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Minimum $10. Balance after top-up:{" "}
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(
                                        parseFloat(MOCK_BALANCE.amount) +
                                        (parseFloat(topUpAmount) || 0)
                                    )}
                                </span>
                            </p>
                        </div>

                        {/* Payment method reminder */}
                        <div className="flex items-center gap-2 rounded-xs border border-border bg-muted/50 px-3 py-2">
                            <CreditCard size={13} className="text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground">
                                Charged to {MOCK_PAYMENT_METHOD.brand} ···· {MOCK_PAYMENT_METHOD.last4}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setTopUpOpen(false)}
                        >
                            Cancel
                        </Button>
                        {/* TODO: wire up POST /v2/orgs/{org_id}/topup with { amount: parseFloat(topUpAmount) } */}
                        <Button
                            disabled={!topUpAmount || parseFloat(topUpAmount) < 10}
                            onClick={() => {
                                // TODO: call topup API then refetch balance
                                setTopUpOpen(false);
                            }}
                        >
                            Add {topUpAmount ? formatCurrency(topUpAmount) : "credits"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}