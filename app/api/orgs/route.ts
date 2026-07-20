import { NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { OrgSummaryListResponse } from "@/lib/api-types";

// GET /api/orgs → GET /v2/orgs
// Returns OrgSummaryListResponse: { orgs: [{ org_id, org_name }] }
// NOTE: new spec changed from MembershipListResponse to OrgSummaryListResponse
// role/member_id now lives on GET /v2/orgs/{org_id}/members/me
export async function GET() {
    try {
        const data = await apiGet<OrgSummaryListResponse>("/v2/orgs");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs error:", err);
        return NextResponse.json(
            { error: "Failed to fetch organisations." },
            { status: 500 }
        );
    }
}