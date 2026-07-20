import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { OrgBalanceResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/balance → GET /v2/orgs/{org_id}/balance
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<OrgBalanceResponse>(`/v2/orgs/${id}/balance`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/balance error:", err);
        return NextResponse.json({ error: "Failed to fetch balance." }, { status: 500 });
    }
}