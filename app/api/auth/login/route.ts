import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required." },
                { status: 400 }
            );
        }

        const credentials = Buffer.from(`${username}:${password}`).toString("base64");

        const res = await fetch(`${process.env.NEXT_PUBLIC_ADXC_API_URL}/v1/users/me`, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        console.log("API response status:", res.status);

        if (!res.ok) {
            return NextResponse.json(
                { error: "Invalid username or password." },
                { status: 401 }
            );
        }

        const user = await res.json();

        const response = NextResponse.json({ success: true, user });
        response.cookies.set("adxc_auth", credentials, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (err) {
        console.error("Login error:", err); // ← this will show exact error
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}