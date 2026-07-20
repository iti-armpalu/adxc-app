// Returns the logged-in user's name and email.
// Called by the sidebar to display the current user's identity.
import { NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { UserV2MeResponse } from "@/lib/api-types";

export async function GET() {
    try {
        const data = await apiGet<UserV2MeResponse>("/v2/users/me");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/me error:", err);
        return NextResponse.json(
            { error: "Failed to fetch user." },
            { status: 500 }
        );
    }
}