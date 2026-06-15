import { NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { MembershipListResponse } from "@/lib/api-types";

export async function GET() {
    try {
        const data = await apiGet<MembershipListResponse>("/v2/orgs");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs error:", err);
        return NextResponse.json(
            { error: "Failed to fetch memberships." },
            { status: 500 }
        );
    }
}