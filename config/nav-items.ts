import {
    LayoutDashboard,
    CreditCard,
    Activity,
    Building2,
    type LucideIcon,
  } from "lucide-react";
  
  export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
  }
  
  export const NAV_ITEMS: NavItem[] = [
    { href: "/",             label: "Dashboard",        icon: LayoutDashboard },
    { href: "/billing",      label: "Billing",          icon: CreditCard },
    { href: "/spending",     label: "Spending & limits", icon: Activity },
    { href: "/organization", label: "Organization",     icon: Building2 },
  ];