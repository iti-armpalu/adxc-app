import { NextRequest, NextResponse } from "next/server";
import { apiDelete } from "@/lib/api-client";

// DELETE /api/users/[id] → DELETE /v2/admin/users/{user_id}
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await apiDelete(`/v2/admin/users/${id}`);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("DELETE /api/users/[id] error:", err);
        return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
    }
}