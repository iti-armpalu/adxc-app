import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPost } from "@/lib/api-client";
import type { UserListResponse, AdminUserResponse } from "@/lib/api-types";

// GET /api/users → GET /v1/users
export async function GET() {
    try {
        const data = await apiGet<UserListResponse>("/v1/users");
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/users error:", err);
        return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
    }
}

// POST /api/users → POST /v2/admin/users
// body: CreateUserRequest { username, email, password }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = await apiPost<AdminUserResponse>("/v2/admin/users", body);
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("POST /api/users error:", err);
        return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }
}