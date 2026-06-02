"use client";

// components/nav-rail.tsx
//
// Persistent 48px brand-700 rail. Lives in (app)/layout so it appears
// on every authenticated surface (admin + member orgs).
// Extend with icon buttons here as new top-level surfaces are added.

import Link from "next/link";
import Image from "next/image";

export function NavRail() {
    return (
        <div className="flex flex-col items-center justify-between w-12 h-screen bg-brand-700 shrink-0 sticky top-0 py-4 z-50">

            {/* Logo — links to admin overview for platform admins */}
            {/* TODO: route based on user role (admin → /admin/overview, member → /orgs) */}
            <Link
                href="/admin/overview"
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors duration-100"
                aria-label="Go to overview"
            >
                <Image
                    src="/adxc-logo-white-stacked.svg"
                    alt="ADXC"
                    width={21}
                    height={24}
                    className="w-7 object-contain"
                    priority
                />
            </Link>

            {/* Bottom slot — reserved for future: notifications, user avatar, etc. */}
            <div />

        </div>
    );
}