"use client";

import { use } from "react";
import { AppShell } from "@/components/app-shell";

export default function OrganisationsLayout({
    children,
    params: paramsPromise,
}: {
    children: React.ReactNode;
    params: Promise<{ org_id: string }>;
}) {
    const { org_id } = use(paramsPromise);

    // TODO: fetch role from GET /v2/orgs/{org_id}/members/me
    const role = "org_admin" as const;

    return (
        <AppShell variant="member" orgId={org_id} role={role}>
            {children}
        </AppShell>
    );
}