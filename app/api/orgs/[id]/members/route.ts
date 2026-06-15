import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPost } from "@/lib/api-client";
import type { OrgMemberListResponse, OrgMemberResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/members → GET /v2/orgs/{org_id}/members
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<OrgMemberListResponse>(`/v2/orgs/${id}/members`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/members error:", err);
        return NextResponse.json({ error: "Failed to fetch members." }, { status: 500 });
    }
}

// POST /api/orgs/[id]/members → POST /v2/orgs/{org_id}/members
// body: AddMemberRequest { email: string, role: "member" | "org_admin" }
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = await apiPost<OrgMemberResponse>(`/v2/orgs/${id}/members`, body);
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("POST /api/orgs/[id]/members error:", err);
        return NextResponse.json({ error: "Failed to add member." }, { status: 500 });
    }
}