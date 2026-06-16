import { NextRequest, NextResponse } from "next/server";
import { apiDelete, ApiError } from "@/lib/api-client";

// DELETE /api/orgs/[id]/api-keys/[key_id] → DELETE /v2/orgs/{org_id}/api-keys/{key_id}
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; key_id: string }> }
) {
    try {
        const { id, key_id } = await params;
        await apiDelete(`/v2/orgs/${id}/api-keys/${key_id}`);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error("DELETE /api/orgs/[id]/api-keys/[key_id] error:", err);
        return NextResponse.json({ error: "Failed to delete API key." }, { status: 500 });
    }
}