"use client";

import { useState } from "react";
import { Save, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET  /v2/orgs/{org_id}         → { daily_member_spend_cap }
// PATCH /v2/orgs/{org_id}/limits → update spend cap

const MOCK = {
    spend_cap: "500.00",
    spend_this_month: "127.50",
    currency: "USD",
    cap_updated_at: "May 1, 2026",
};

function formatCurrency(value: string) {
    return `$${parseFloat(value).toFixed(2)}`;
}

function spendPercent(spent: string, cap: string) {
    return Math.min(Math.round((parseFloat(spent) / parseFloat(cap)) * 100), 100);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

interface SpendProgressProps {
    spent: string;
    cap: string;
}

function SpendProgress({ spent, cap }: SpendProgressProps) {
    const percent = spendPercent(spent, cap);
    const isWarning = percent >= 70 && percent < 100;
    const isBlocked = percent >= 100;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    {formatCurrency(spent)} spent
                </span>
                <span className={`font-semibold ${isBlocked ? "text-destructive" :
                        isWarning ? "text-orange-600" :
                            "text-muted-foreground"
                    }`}>
                    {formatCurrency(cap)} limit
                </span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isBlocked ? "bg-destructive" :
                            isWarning ? "bg-orange-500" :
                                "bg-primary"
                        }`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{percent}% used this month</span>
                {isBlocked && (
                    <Badge variant="destructive" className="text-xs">
                        Limit reached
                    </Badge>
                )}
                {isWarning && (
                    <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                        Approaching limit
                    </Badge>
                )}
                {!isWarning && !isBlocked && (
                    <Badge variant="secondary" className="text-xs">
                        On track
                    </Badge>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpendingPage() {
    const [cap, setCap] = useState(MOCK.spend_cap);
    const [inputValue, setInputValue] = useState(MOCK.spend_cap);
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);

    const percent = spendPercent(MOCK.spend_this_month, cap);
    const isBlocked = percent >= 100;
    const isWarning = percent >= 70 && percent < 100;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
        setDirty(e.target.value !== cap);
        setSaved(false);
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        const parsed = parseFloat(inputValue);
        if (isNaN(parsed) || parsed <= 0) return;
        // TODO: PATCH /v2/orgs/{org_id}/limits with { spend_cap: parsed }
        setCap(parsed.toFixed(2));
        setDirty(false);
        setSaved(true);
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-2xl">

            {/* ── Page title ── */}
            <div>
                <h2 className="text-h4 font-bold text-foreground tracking-[-0.02em]">
                    Spending & Limits
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Set a monthly spend cap to control how much your organisation spends on data queries.
                </p>
            </div>

            {/* ── Blocked alert ── */}
            {isBlocked && (
                <Alert variant="destructive">
                    <ShieldAlert size={16} />
                    <AlertTitle>Monthly limit reached</AlertTitle>
                    <AlertDescription>
                        Your organisation has reached its monthly spend limit. New queries are blocked until the limit is raised or the month resets.
                    </AlertDescription>
                </Alert>
            )}

            {/* ── Warning alert ── */}
            {isWarning && !isBlocked && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                    <AlertTriangle size={16} className="text-orange-600" />
                    <AlertTitle className="text-orange-800">Approaching your limit</AlertTitle>
                    <AlertDescription className="text-orange-700">
                        You've used {percent}% of your monthly limit. Consider raising it to avoid queries being blocked.
                    </AlertDescription>
                </Alert>
            )}

            {/* ── Current progress ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            This month's spend
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            May 2026
                        </Badge>
                    </div>
                    <CardDescription>
                        Resets at the start of each calendar month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SpendProgress spent={MOCK.spend_this_month} cap={cap} />
                </CardContent>
            </Card>

            {/* ── Edit limit ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        Monthly spend limit
                    </CardTitle>
                    <CardDescription>
                        Queries will be blocked once your monthly limit is reached. Set to a value that reflects your expected usage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="spend-cap">Limit amount (USD)</Label>
                            <div className="flex gap-3 items-center">
                                <div className="relative max-w-[200px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                        $
                                    </span>
                                    <Input
                                        id="spend-cap"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={inputValue}
                                        onChange={handleChange}
                                        className="pl-7"
                                        placeholder="500.00"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!dirty}
                                    className="gap-1.5"
                                >
                                    <Save size={14} />
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Save confirmation */}
                        {saved && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                                <CheckCircle2 size={13} />
                                <span>Limit updated to {formatCurrency(cap)}</span>
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Last updated: {MOCK.cap_updated_at}
                        </p>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* ── What happens when limit is reached ── */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">
                    How limits work
                </h3>
                <Card className="bg-muted/40 border-dashed">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex flex-col gap-3">
                            {[
                                {
                                    icon: <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />,
                                    text: "Limits are enforced in real time — queries that would exceed your cap are blocked before they run."
                                },
                                {
                                    icon: <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />,
                                    text: "You'll see a warning when you reach 70% of your limit."
                                },
                                {
                                    icon: <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />,
                                    text: "Your limit resets automatically at the start of each calendar month."
                                },
                                {
                                    icon: <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />,
                                    text: "You can raise your limit at any time — changes take effect immediately."
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    {item.icon}
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}