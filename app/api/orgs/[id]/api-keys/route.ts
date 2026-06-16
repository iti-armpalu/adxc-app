import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import type { ApiKeyListResponse, CreateApiKeyResponse } from "@/lib/api-types";

// GET /api/orgs/[id]/api-keys → GET /v2/orgs/{org_id}/api-keys
// Runtime: org_admin only
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await apiGet<ApiKeyListResponse>(`/v2/orgs/${id}/api-keys`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/orgs/[id]/api-keys error:", err);
        return NextResponse.json({ error: "Failed to fetch API keys." }, { status: 500 });
    }
}

// POST /api/orgs/[id]/api-keys → POST /v2/orgs/{org_id}/api-keys
// body: CreateApiKeyRequest { name: string }
// Returns CreateApiKeyResponse — includes raw_token (shown once only)
// Runtime: org_admin only
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = await apiPost<CreateApiKeyResponse>(`/v2/orgs/${id}/api-keys`, body);
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error("POST /api/orgs/[id]/api-keys error:", err);
        return NextResponse.json({ error: "Failed to create API key." }, { status: 500 });
    }
}