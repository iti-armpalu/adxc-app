// config/nav-items.ts
//
// Admin nav items. Icons from lucide-react.
// Add new routes here — sidebar renders from this config automatically.

import {
    LayoutDashboard,
    Users,
    Building2,
    SearchCode,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
    {
        label: "Overview",
        href: "/admin/overview",
        icon: LayoutDashboard,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Organisations",
        href: "/admin/organisations",
        icon: Building2,
    },
    {
        label: "Queries",
        href: "/admin/queries",
        icon: SearchCode,
    },
];