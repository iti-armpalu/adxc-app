"use client";

// ⚠️ DEV ONLY — remove before production
// Temporary toggle to switch between superadmin (/admin) and org admin (/dashboard) routes.

import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DevRoleToggle() {
    const pathname = usePathname();
    const router = useRouter();

    const isSuperadmin = pathname.startsWith("/admin");

    function handleToggle(checked: boolean) {
        if (checked) {
            router.push("/admin/organizations");
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-2 shadow-lg text-xs font-medium select-none">
            {/* Dev label */}
            <span className="text-muted-foreground font-mono uppercase tracking-wide text-[10px]">
                DEV
            </span>

            <div className="w-px h-3.5 bg-border" />

            {/* Org admin side */}
            <div className={`flex items-center gap-1 transition-colors ${!isSuperadmin ? "text-foreground" : "text-muted-foreground"
                }`}>
                <User size={12} />
                <span>Org admin</span>
            </div>

            <Switch
                checked={isSuperadmin}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
            />

            {/* Superadmin side */}
            <div className={`flex items-center gap-1 transition-colors ${isSuperadmin ? "text-foreground" : "text-muted-foreground"
                }`}>
                <ShieldCheck size={12} />
                <span>Superadmin</span>
            </div>
        </div>
    );
}