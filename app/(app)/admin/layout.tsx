// // app/(app)/admin/layout.tsx
// //
// // Admin-specific layout. Sits inside the (app) shell which provides NavRail.
// // Adds the admin NavSidebar to the left of main content.

// import { AdminNavSidebar } from "@/components/admin-nav-sidebar";

// export default function AdminLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <div className="flex flex-1 min-h-0 overflow-hidden">
//             <AdminNavSidebar />
//             <main className="flex-1 overflow-y-auto bg-background">
//                 {children}
//             </main>
//         </div>
//     );
// }


import { AppShell } from "@/components/app-shell";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell variant="admin">{children}</AppShell>;
}