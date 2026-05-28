"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET   /v2/orgs/{org_id}    → org object
// PATCH /v2/orgs/{org_id}    → update org record

const MOCK = {
    id: 1,
    name: "DEPT Agency",
    contact_name: "Maya Chen",
    contact_email: "maya.chen@deptagency.com",
    billing_address: "85 Broad St, New York, NY 10004",
    created_at: "January 12, 2026",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
    const [form, setForm] = useState({
        name: MOCK.name,
        contact_name: MOCK.contact_name,
        contact_email: MOCK.contact_email,
        billing_address: MOCK.billing_address,
    });
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);

    function handleChange(field: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
            setDirty(true);
            setSaved(false);
        };
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        // TODO: PATCH /v2/orgs/{org_id} with form values
        setDirty(false);
        setSaved(true);
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-2xl">

            {/* ── Page title ── */}
            <div>
                <h2 className="text-h4 font-bold text-foreground tracking-[-0.02em]">
                    Organization
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your organisation's details and contact information.
                </p>
            </div>

            {/* ── Org form ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            Organisation details
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs font-mono">
                            ID #{MOCK.id}
                        </Badge>
                    </div>
                    <CardDescription>
                        This information is used for billing and account management.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSave} className="flex flex-col gap-5">

                        {/* Org name */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="org-name">Organisation name</Label>
                            <Input
                                id="org-name"
                                type="text"
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="Your organisation name"
                            />
                        </div>

                        <Separator />

                        {/* Contact name */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="contact-name">Primary contact name</Label>
                            <Input
                                id="contact-name"
                                type="text"
                                value={form.contact_name}
                                onChange={handleChange("contact_name")}
                                placeholder="Full name"
                            />
                        </div>

                        {/* Contact email */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="contact-email">Contact email</Label>
                            <Input
                                id="contact-email"
                                type="email"
                                value={form.contact_email}
                                onChange={handleChange("contact_email")}
                                placeholder="you@company.com"
                            />
                        </div>

                        <Separator />

                        {/* Billing address */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="billing-address">Billing address</Label>
                            <Input
                                id="billing-address"
                                type="text"
                                value={form.billing_address}
                                onChange={handleChange("billing_address")}
                                placeholder="Street, City, State, ZIP"
                            />
                        </div>

                        {/* Save row */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 h-8">
                                {saved && (
                                    <>
                                        <CheckCircle2 size={13} />
                                        <span>Changes saved</span>
                                    </>
                                )}
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!dirty}
                                className="gap-1.5"
                            >
                                <Save size={14} />
                                Save changes
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>

            {/* ── Read-only info ── */}
            <Card className="bg-muted/40 border-dashed">
                <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Member since
                            </span>
                            <span className="text-xs text-foreground font-medium">
                                {MOCK.created_at}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Account managed by
                            </span>
                            <span className="text-xs text-foreground font-medium">
                                ADXC
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Need to make changes?
                            </span>
                            <a
                                href="mailto:accounts@adxc.ai"
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Contact your account manager
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}