import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect root to login
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect admin and org routes
    const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/organisations");

    const token = request.cookies.get("adxc_auth");

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect logged-in users away from login page
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};