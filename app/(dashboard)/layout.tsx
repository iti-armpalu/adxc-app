import { NavRail } from "@/components/nav-rail";
import { NavSidebar } from "@/components/nav-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TooltipProvider>
            <div className="flex h-screen overflow-hidden">

                {/* Dark icon rail — 48px fixed */}
                <NavRail />

                {/* Everything to the right of the rail */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                    {/* Top bar — shared across all pages, spans sidebar + content */}
                    <div className="shrink-0 px-4 py-3 bg-card border-b border-border">
                        <h1 className="text-h4 font-bold text-foreground tracking-[-0.02em]">
                            Settings
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage your account and organization preferences
                        </p>
                    </div>

                    {/* Sidebar + main content side by side */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        <NavSidebar />
                        <main className="flex-1 overflow-y-auto bg-background">
                            {children}
                        </main>
                    </div>

                </div>

            </div>
        </TooltipProvider>
    );
}