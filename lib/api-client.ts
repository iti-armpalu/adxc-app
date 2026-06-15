import { cookies } from "next/headers";

const BASE = process.env.ADXC_API_URL ?? "https://api.adxc.ai";

async function authHeader(): Promise<HeadersInit> {
    const cookieStore = await cookies();
    const credentials = cookieStore.get("adxc_auth")?.value;

    if (!credentials) throw new Error("Not authenticated");

    return { Authorization: `Basic ${credentials}` };
}

export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: {
            ...(await authHeader()),
            "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: {
            ...(await authHeader()),
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return res.json();
}

export async function apiDelete(path: string): Promise<void> {
    const res = await fetch(`${BASE}${path}`, {
        method: "DELETE",
        headers: await authHeader(),
    });

    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
}