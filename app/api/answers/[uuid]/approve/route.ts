import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { AnswerApproveResponse } from "@/lib/api-types";

// POST /api/answers/[uuid]/approve → POST /v1/answers/{answer_uuid}/approve
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;
        const data = await apiPost<AnswerApproveResponse>(`/v1/answers/${uuid}/approve`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("POST /api/answers/[uuid]/approve error:", err);
        return NextResponse.json({ error: "Failed to approve answer." }, { status: 500 });
    }
}