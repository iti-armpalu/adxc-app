import { NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { UserMeResponse } from "@/lib/api-types";

export async function GET() {
    try {
        const data = await apiGet<UserMeResponse>("/v1/users/me");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/me error:", err);
        return NextResponse.json(
            { error: "Failed to fetch user." },
            { status: 500 }
        );
    }
}