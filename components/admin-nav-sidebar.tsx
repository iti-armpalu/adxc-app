"use client";

// components/admin-nav-sidebar.tsx
//
// Admin-specific sidebar. 240px, sits to the right of NavRail.
// Driven by ADMIN_NAV_ITEMS config. Active state via pathname.startsWith().

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS } from "@/config/nav-items";

export function AdminNavSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    function handleSignOut() {
        // TODO: clear auth token once Rob's auth is wired
        router.push("/login");
    }

    return (
        <div className="flex flex-col w-[240px] h-full bg-sidebar border-r border-sidebar-border shrink-0">

            {/* Section label */}
            <div className="px-5 pt-5 pb-4">
                <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-widest">
                    Platform admin
                </span>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 flex flex-col gap-0.5" aria-label="Admin navigation">
                {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 h-9 px-3 rounded
                                text-sm tracking-[-0.025em] transition-colors duration-100
                                ${isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }
                            `}
                        >
                            <item.icon size={16} strokeWidth={1.6} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User + sign out */}
            <div className="px-2 py-3 border-t border-sidebar-border flex flex-col gap-2">
                <div className="flex flex-col px-2 py-2 gap-0.5">
                    <span className="text-[13px] font-semibold text-sidebar-primary truncate leading-tight">
                        {/* TODO: real username from auth context */}
                        iti
                    </span>
                    <span className="text-[11px] text-sidebar-muted truncate leading-tight">
                        Platform administrator
                    </span>
                </div>
                <Separator className="bg-sidebar-border" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-9 px-3 text-[13px] font-medium tracking-[-0.025em] text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={handleSignOut}
                >
                    <LogOut size={15} strokeWidth={1.6} />
                    Sign out
                </Button>
            </div>

        </div>
    );
}