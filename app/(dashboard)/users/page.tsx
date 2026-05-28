import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real API calls
// GET /v2/orgs/{org_id}/members/me  → OrgMemberResponse
// { member_id, user_id, username, role, created_at, updated_at }

const MOCK_USER = {
    member_id: 1,
    username: "maya.chen",
    email: "maya.chen@deptagency.com",
    role: "org_admin",
    joined_at: "January 12, 2026",
};

function getInitials(username: string) {
    return username
        .split(".")
        .map((n) => n[0].toUpperCase())
        .join("")
        .slice(0, 2);
}

function getRoleLabel(role: string) {
    if (role === "org_admin") return "Admin";
    return "Member";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-8 p-8 max-w-2xl">

            {/* ── Page title ── */}
            <div>
                <h2 className="text-h4 font-bold text-foreground tracking-[-0.02em]">
                    Users
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage who has access to your organisation's ADXC account.
                </p>
            </div>

            {/* ── User list ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            Organisation members
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            1 member
                        </Badge>
                    </div>
                    <CardDescription>
                        Your organisation currently supports one user account.
                        Multi-user access is coming in a future update.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                    <Separator className="mb-4" />

                    {/* User row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                                    {getInitials(MOCK_USER.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                                    {/* TODO: replace with real name from API */}
                                    {MOCK_USER.username}
                                </span>
                                <span className="text-xs text-muted-foreground truncate leading-tight">
                                    {/* TODO: replace with real email from API */}
                                    {MOCK_USER.email}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Badge
                                variant="secondary"
                                className="text-xs font-medium bg-brand-50 text-brand-700 border-brand-100"
                            >
                                {getRoleLabel(MOCK_USER.role)}
                            </Badge>
                        </div>
                    </div>

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
                                {MOCK_USER.joined_at}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Multi-user support
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                Coming soon
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Need to add a user?
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