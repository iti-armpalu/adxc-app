import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { AnswerPreviewResponse } from "@/lib/api-types";

// GET /api/answers/[uuid] → GET /v1/answers/{answer_uuid}
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;
        const data = await apiGet<AnswerPreviewResponse>(`/v1/answers/${uuid}`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/answers/[uuid] error:", err);
        return NextResponse.json({ error: "Failed to fetch answer." }, { status: 500 });
    }
}