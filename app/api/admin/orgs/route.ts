import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import type { OrgListResponse, AdminOrgResponse } from "@/lib/api-types";

// GET /api/admin/orgs → GET /v2/admin/orgs (undocumented but confirmed working)
export async function GET() {
    try {
        const data = await apiGet<OrgListResponse>("/v2/admin/orgs");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/admin/orgs error:", err);
        return NextResponse.json({ error: "Failed to fetch organisations." }, { status: 500 });
    }
}

// POST /api/admin/orgs → POST /v2/admin/orgs (undocumented — confirm with Rob)
// body: CreateOrgRequest { name, daily_member_spend_cap? }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = await apiPost<AdminOrgResponse>("/v2/admin/orgs", body);
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error("POST /api/admin/orgs error:", err);
        return NextResponse.json({ error: "Failed to create organisation." }, { status: 500 });
    }
}