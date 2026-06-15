import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { OrgListResponse, AdminOrgResponse } from "@/lib/api-types";

// GET /api/admin/orgs/[id]
// No dedicated GET /v2/admin/orgs/{id} endpoint exists yet.
// Workaround: fetch full org list and find by id.
// TODO: replace with GET /v2/admin/orgs/{id} once Rob adds it
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<OrgListResponse>("/v2/admin/orgs");
        const org = data.orgs.find((o: AdminOrgResponse) => String(o.id) === id);
        if (!org) {
            return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
        }
        return NextResponse.json(org);
    } catch (err) {
        console.error("GET /api/admin/orgs/[id] error:", err);
        return NextResponse.json({ error: "Failed to fetch organisation." }, { status: 500 });
    }
}