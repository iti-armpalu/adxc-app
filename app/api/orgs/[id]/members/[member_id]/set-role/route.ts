import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { OrgMemberResponse } from "@/lib/api-types";

// POST /api/orgs/[id]/members/[member_id]/set-role → POST /v2/orgs/{org_id}/members/{member_id}/set_role
// body: SetRoleRequest { role: "member" | "org_admin" }
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; member_id: string }> }
) {
    try {
        const { id, member_id } = await params;
        const body = await req.json();
        const data = await apiPost<OrgMemberResponse>(
            `/v2/orgs/${id}/members/${member_id}/set_role`,
            body
        );
        return NextResponse.json(data);
    } catch (err) {
        console.error("POST /api/orgs/[id]/members/[member_id]/set-role error:", err);
        return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
    }
}