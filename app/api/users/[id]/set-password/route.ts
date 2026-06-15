import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";

// POST /api/users/[id]/set-password → POST /v2/admin/users/{user_id}/set_password
// body: SetUserPasswordRequest { password }
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        await apiPost(`/v2/admin/users/${id}/set_password`, body);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("POST /api/users/[id]/set-password error:", err);
        return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
    }
}