"use client";

import { useState } from "react";
import {
    Building2,
    Globe,
    Mail,
    Copy,
    Check,
    RefreshCw,
    Eye,
    EyeOff,
    AlertTriangle,
    ExternalLink,
    ChevronRight,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET  /v2/orgs/{org_id}                     → OrgResponse
// PUT  /v2/orgs/{org_id}                     → OrgResponse
// GET  /v2/orgs/{org_id}/api-keys            → ApiKeyListResponse
// POST /v2/orgs/{org_id}/api-keys/rotate     → ApiKeyResponse
// GET  /v2/orgs/{org_id}/notifications       → NotificationPrefsResponse
// PUT  /v2/orgs/{org_id}/notifications       → NotificationPrefsResponse
// DELETE /v2/orgs/{org_id}                   → 204

const MOCK_ORG = {
    id: "org_dept_001",
    name: "DEPT",
    slug: "dept",
    domain: "deptagency.com",
    billing_email: "billing@deptagency.com",
    created_at: "March 2025",
    plan: "Agency",
    api_key: "adxc_live_sk_8f2a1c9d4e7b3f6a2d5e8c1b4f7a3d6e",
    webhook_url: "https://internal.deptagency.com/webhooks/adxc",
    webhook_secret: "whsec_4f8b2a1c9d3e7f6a2b5d8e1c4b7f3a6d",
};

const MOCK_NOTIFICATIONS = {
    low_balance: true,
    spend_limit_warning: true,
    spend_limit_reached: true,
    new_result_ready: false,
    weekly_digest: true,
    recipient_email: "billing@deptagency.com",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskSecret(value: string) {
    return value.slice(0, 12) + "••••••••••••••••••••••••";
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <Check size={13} className="text-emerald-600" />
            ) : (
                <Copy size={13} />
            )}
        </Button>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

// ─── Org profile form ─────────────────────────────────────────────────────────

function OrgProfile() {
    const [name, setName] = useState(MOCK_ORG.name);
    const [domain, setDomain] = useState(MOCK_ORG.domain);
    const [billingEmail, setBillingEmail] = useState(MOCK_ORG.billing_email);
    const [saved, setSaved] = useState(false);

    function handleSave() {
        // TODO: PUT /v2/orgs/{org_id} { name, domain, billing_email }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    const isDirty =
        name !== MOCK_ORG.name ||
        domain !== MOCK_ORG.domain ||
        billingEmail !== MOCK_ORG.billing_email;

    return (
        <Card>
            <CardContent className="pt-5 pb-5 flex flex-col gap-4">

                {/* Org name */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="org-name" className="text-xs font-medium">
                        Organisation name
                    </Label>
                    <div className="relative">
                        <Building2
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="org-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Domain */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="org-domain" className="text-xs font-medium">
                        Domain
                    </Label>
                    <div className="relative">
                        <Globe
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="org-domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="pl-8"
                            placeholder="yourdomain.com"
                        />
                    </div>
                </div>

                {/* Billing email */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="billing-email" className="text-xs font-medium">
                        Billing email
                    </Label>
                    <p className="text-xs text-muted-foreground -mt-0.5">
                        Invoices and spend alerts are sent here.
                    </p>
                    <div className="relative">
                        <Mail
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="billing-email"
                            type="email"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Save */}
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                        Org ID:{" "}
                        <span className="font-mono text-foreground">
                            {MOCK_ORG.id}
                        </span>
                    </p>
                    <div className="flex items-center gap-2">
                        {saved && (
                            <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                                <Check size={12} />
                                Saved
                            </span>
                        )}
                        <Button
                            size="sm"
                            disabled={!isDirty}
                            onClick={handleSave}
                        >
                            Save changes
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

// ─── API credentials ──────────────────────────────────────────────────────────

function ApiCredentials() {
    const [showKey, setShowKey] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(MOCK_ORG.webhook_url);
    const [rotateOpen, setRotateOpen] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [rotated, setRotated] = useState(false);

    function handleRotate() {
        setRotating(true);
        // TODO: POST /v2/orgs/{org_id}/api-keys/rotate
        setTimeout(() => {
            setRotating(false);
            setRotated(true);
            setRotateOpen(false);
            setTimeout(() => setRotated(false), 3000);
        }, 1200);
    }

    return (
        <>
            <Card>
                <CardContent className="pt-5 pb-5 flex flex-col gap-5">

                    {/* API key */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">API key</Label>
                            {rotated && (
                                <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                                    <Check size={11} />
                                    Key rotated
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-0 rounded border border-border bg-muted/40 h-9 px-3 font-mono text-xs text-foreground overflow-hidden">
                                <span className="truncate">
                                    {showKey
                                        ? MOCK_ORG.api_key
                                        : maskSecret(MOCK_ORG.api_key)}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                onClick={() => setShowKey((v) => !v)}
                                aria-label={showKey ? "Hide key" : "Reveal key"}
                            >
                                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <CopyButton value={MOCK_ORG.api_key} />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs shrink-0 gap-1.5"
                                onClick={() => setRotateOpen(true)}
                            >
                                <RefreshCw size={12} />
                                Rotate
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Used by your integration to authenticate requests to ADXC.
                        </p>
                    </div>

                    <Separator />

                    {/* Webhook URL */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="webhook-url" className="text-xs font-medium">
                            Webhook endpoint
                        </Label>
                        <p className="text-xs text-muted-foreground -mt-0.5">
                            ADXC posts result-ready and spend events to this URL.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="font-mono text-xs"
                                placeholder="https://your-domain.com/webhooks/adxc"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs shrink-0 gap-1"
                            // TODO: POST /v2/orgs/{org_id}/webhooks/test
                            >
                                <ExternalLink size={12} />
                                Test
                            </Button>
                        </div>
                    </div>

                    {/* Webhook secret */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium">
                            Webhook signing secret
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center rounded border border-border bg-muted/40 h-9 px-3 font-mono text-xs text-foreground overflow-hidden">
                                <span className="truncate">
                                    {showSecret
                                        ? MOCK_ORG.webhook_secret
                                        : maskSecret(MOCK_ORG.webhook_secret)}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                onClick={() => setShowSecret((v) => !v)}
                                aria-label={showSecret ? "Hide secret" : "Reveal secret"}
                            >
                                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <CopyButton value={MOCK_ORG.webhook_secret} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Verify incoming webhook payloads using HMAC-SHA256 with this secret.
                        </p>
                    </div>

                    {/* Docs nudge */}
                    <div className="flex items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground flex-1">
                            See the integration guide for setup instructions and payload schemas.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-primary shrink-0"
                            asChild
                        >
                            <a
                                href="https://docs.adxc.io/integration"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Docs
                                <ChevronRight size={12} />
                            </a>
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* Rotate confirm dialog */}
            <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-500" />
                            Rotate API key?
                        </DialogTitle>
                        <DialogDescription>
                            Your current key will be immediately invalidated. Any integration
                            using it — including DEPT's embedded tooling — will stop working
                            until updated with the new key. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setRotateOpen(false)}
                            disabled={rotating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRotate}
                            disabled={rotating}
                            className="gap-1.5"
                        >
                            <RefreshCw
                                size={13}
                                className={rotating ? "animate-spin" : ""}
                            />
                            {rotating ? "Rotating…" : "Yes, rotate key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Notification preferences ─────────────────────────────────────────────────

interface NotifRowProps {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}

function NotifRow({ label, description, checked, onCheckedChange }: NotifRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input shrink-0 mt-0.5"
            />
        </div>
    );
}

function NotificationPrefs() {
    const [prefs, setPrefs] = useState(MOCK_NOTIFICATIONS);
    const [recipientEmail, setRecipientEmail] = useState(
        MOCK_NOTIFICATIONS.recipient_email
    );
    const [saved, setSaved] = useState(false);

    function toggle(key: keyof typeof MOCK_NOTIFICATIONS) {
        // TODO: PUT /v2/orgs/{org_id}/notifications { [key]: value }
        setPrefs((p) => ({ ...p, [key]: !p[key] }));
    }

    function handleSave() {
        // TODO: PUT /v2/orgs/{org_id}/notifications { recipient_email }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    return (
        <Card>
            <CardContent className="pt-2 pb-5 px-5">

                <div className="divide-y divide-border">
                    <NotifRow
                        label="Low balance alert"
                        description="Email when account balance drops below $50."
                        checked={prefs.low_balance}
                        onCheckedChange={() => toggle("low_balance")}
                    />
                    <NotifRow
                        label="Spend limit warning"
                        description="Email when monthly spend reaches the warning threshold."
                        checked={prefs.spend_limit_warning}
                        onCheckedChange={() => toggle("spend_limit_warning")}
                    />
                    <NotifRow
                        label="Spend limit reached"
                        description="Email when the monthly cap is hit and queries are blocked."
                        checked={prefs.spend_limit_reached}
                        onCheckedChange={() => toggle("spend_limit_reached")}
                    />
                    <NotifRow
                        label="Result ready"
                        description="Email when a query result is available for review."
                        checked={prefs.new_result_ready}
                        onCheckedChange={() => toggle("new_result_ready")}
                    />
                    <NotifRow
                        label="Weekly digest"
                        description="Summary of spend, queries run, and account health each Monday."
                        checked={prefs.weekly_digest}
                        onCheckedChange={() => toggle("weekly_digest")}
                    />
                </div>

                <Separator className="my-4" />

                {/* Recipient email */}
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="notif-email"
                        className="text-xs font-medium"
                    >
                        Notification email
                    </Label>
                    <p className="text-xs text-muted-foreground -mt-0.5">
                        All org-level alerts go to this address.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Mail
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                id="notif-email"
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {saved && (
                                <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                                    <Check size={12} />
                                    Saved
                                </span>
                            )}
                            <Button size="sm" onClick={handleSave}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

// ─── Danger zone ──────────────────────────────────────────────────────────────

function DangerZone() {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const CONFIRM_PHRASE = "delete dept";

    return (
        <>
            <Card className="border-destructive/40">
                <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-destructive">
                                Delete organisation
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                Permanently deletes the DEPT organisation, all users, query
                                history, and remaining credit balance. This cannot be undone.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                            onClick={() => setConfirmOpen(true)}
                        >
                            Delete org
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle size={16} />
                            Delete DEPT?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete the organisation and all associated
                            data including users, query history, and any remaining credit
                            balance. This action cannot be reversed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-2">
                        <Label className="text-xs font-medium">
                            Type{" "}
                            <span className="font-mono text-foreground">
                                delete dept
                            </span>{" "}
                            to confirm
                        </Label>
                        <Input
                            value={confirmText}
                            onChange={(e) =>
                                setConfirmText(e.target.value.toLowerCase())
                            }
                            placeholder="delete dept"
                            autoComplete="off"
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmOpen(false);
                                setConfirmText("");
                            }}
                        >
                            Cancel
                        </Button>
                        {/* TODO: DELETE /v2/orgs/{org_id} then redirect to /logout */}
                        <Button
                            variant="destructive"
                            disabled={confirmText !== CONFIRM_PHRASE}
                        >
                            Permanently delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
    return (
        <div className="flex flex-col gap-10 p-8 max-w-4xl">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">
                        DEPT
                    </p>
                    <h2>Organisation</h2>
                </div>
                <Badge variant="secondary" className="mt-1.5 font-medium">
                    {MOCK_ORG.plan} plan
                </Badge>
            </div>

            {/* ── Profile ── */}
            <Section
                title="Profile"
                description="Organisation name, domain, and billing email."
            >
                <OrgProfile />
            </Section>

            <Separator />

            {/* ── API & integration ── */}
            <Section
                title="API & integration"
                description="Credentials used by DEPT's embedded tooling to connect to ADXC."
            >
                <ApiCredentials />
            </Section>

            <Separator />

            {/* ── Notifications ── */}
            <Section
                title="Notifications"
                description="Choose which events trigger email alerts and where they're sent."
            >
                <NotificationPrefs />
            </Section>

            <Separator />

            {/* ── Danger zone ── */}
            <Section
                title="Danger zone"
                description="Irreversible actions. Proceed with caution."
            >
                <DangerZone />
            </Section>

        </div>
    );
}