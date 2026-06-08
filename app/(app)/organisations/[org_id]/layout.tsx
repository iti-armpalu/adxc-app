import { AppShell } from "@/components/app-shell";

export default function OrganisationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // org_id is read from pathname inside AppShell via usePathname()
    // role TODO: fetch from GET /v2/orgs/{org_id}/members/me
    return (
        <AppShell variant="member" role="org_admin">
            {children}
        </AppShell>
    );
}