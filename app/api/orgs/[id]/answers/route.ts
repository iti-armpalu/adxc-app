import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { AnswerListResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/answers → GET /v2/orgs/{org_id}/answers
// Runtime: requires org_admin role — members receive 403
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<AnswerListResponse>(`/v2/orgs/${id}/answers`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/answers error:", err);
        return NextResponse.json({ error: "Failed to fetch answers." }, { status: 500 });
    }
}