import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect root to login
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // TODO: auth guard — check session token/cookie once real auth is in place
    // const token = request.cookies.get("token");
    // if (
    //   !token &&
    //   (pathname.startsWith("/admin") || pathname.startsWith("/organisations"))
    // ) {
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};