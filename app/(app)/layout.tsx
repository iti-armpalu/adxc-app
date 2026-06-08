// app/(app)/layout.tsx
//
// Authenticated shell. All routes under (app)/ inherit the NavRail.
// (auth)/login sits outside this group so it renders with no chrome.

import { NavRail } from "@/components/nav-rail";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* <NavRail /> */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}