"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/config/nav-items";

export function NavSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    function handleSignOut() {
        // TODO: clear auth token once Rob's auth is wired
        // e.g. document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        router.push("/login");
    }

    return (
        <div className="flex flex-col w-[240px] h-full bg-sidebar border-r border-sidebar-border shrink-0">

            {/* Nav items */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 h-9 px-3 rounded
                                text-sm text-sidebar-foreground tracking-[-0.025em]
                                transition-colors duration-100
                                ${isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }
                            `}
                        >
                            <item.icon size={16} strokeWidth={1.6} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-2 py-3 border-t border-sidebar-border flex flex-col gap-2">
                <div className="flex flex-col px-2 py-2 gap-0.5">
                    <span className="text-[13px] font-semibold text-sidebar-primary truncate leading-tight">
                        {/* TODO: real name from API */}
                        Maya Chen
                    </span>
                    <span className="text-[11px] text-sidebar-foreground truncate leading-tight">
                        {/* TODO: real org from API */}
                        Northwind Insights
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