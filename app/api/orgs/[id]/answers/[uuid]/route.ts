import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPost } from "@/lib/api-client";
import type { AnswerPreviewResponse, AnswerApproveResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/answers/[uuid] → GET /v2/orgs/{org_id}/answers/{answer_uuid}
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; uuid: string }> }
) {
    try {
        const { id, uuid } = await params;
        const data = await apiGet<AnswerPreviewResponse>(`/v2/orgs/${id}/answers/${uuid}`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/answers/[uuid] error:", err);
        return NextResponse.json({ error: "Failed to fetch answer." }, { status: 500 });
    }
}