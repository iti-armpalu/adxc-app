import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { AnswerListResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/members/me/answers → GET /v2/orgs/{org_id}/members/me/answers
// Returns only the answers belonging to the authenticated member
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<AnswerListResponse>(`/v2/orgs/${id}/members/me/answers`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/members/me/answers error:", err);
        return NextResponse.json({ error: "Failed to fetch answers." }, { status: 500 });
    }
}