import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { MemberMeResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/members/me → GET /v2/orgs/{org_id}/members/me
// Returns the authenticated user's membership details including role
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<MemberMeResponse>(`/v2/orgs/${id}/members/me`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/members/me error:", err);
        return NextResponse.json({ error: "Failed to fetch member." }, { status: 500 });
    }
}