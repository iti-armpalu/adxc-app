// config/org-nav-items.ts
//
// Member-facing org nav items.
// Unlike admin nav, these are dynamic — href includes the org ID.
// Call getOrgNavItems(orgId) to get the full list.
// Items marked adminOnly are hidden for role: "member".

import {
    LayoutDashboard,
    MessageSquareText,
    BookOpen,
    Users,
    KeyRound,
} from "lucide-react";

export interface OrgNavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    adminOnly?: boolean;
}

export function getOrgNavItems(orgId: number): OrgNavItem[] {
    return [
        {
            label: "Dashboard",
            href: `/orgs/${orgId}`,
            icon: LayoutDashboard,
        },
        {
            label: "Answers",
            href: `/orgs/${orgId}/answers`,
            icon: BookOpen,
        },
        {
            label: "Members",
            href: `/orgs/${orgId}/members`,
            icon: Users,
            adminOnly: true,
        },
        {
            label: "API keys",
            href: `/orgs/${orgId}/api-keys`,
            icon: KeyRound,
            adminOnly: true,
        },
    ];
}