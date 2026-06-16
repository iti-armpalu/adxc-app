import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { AnswerApproveResponse } from "@/lib/api-types";

// POST /api/orgs/[id]/answers/[uuid]/approve → POST /v2/orgs/{org_id}/answers/{answer_uuid}/approve
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; uuid: string }> }
) {
    try {
        const { id, uuid } = await params;
        const data = await apiPost<AnswerApproveResponse>(`/v2/orgs/${id}/answers/${uuid}/approve`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("POST /api/orgs/[id]/answers/[uuid]/approve error:", err);
        return NextResponse.json({ error: "Failed to approve answer." }, { status: 500 });
    }
}