import { NextRequest, NextResponse } from "next/server";
import { apiDelete } from "@/lib/api-client";

// DELETE /api/orgs/[id]/members/[member_id] → DELETE /v2/orgs/{org_id}/members/{member_id}
// Runtime: org_admin only
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; member_id: string }> }
) {
    try {
        const { id, member_id } = await params;
        await apiDelete(`/v2/orgs/${id}/members/${member_id}`);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("DELETE /api/orgs/[id]/members/[member_id] error:", err);
        return NextResponse.json({ error: "Failed to remove member." }, { status: 500 });
    }
}