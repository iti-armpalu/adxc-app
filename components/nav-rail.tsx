"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavRail() {
    return (
        <div className="flex flex-col items-center justify-between w-12 h-screen bg-brand-shades-700 shrink-0 sticky top-0 py-4 z-50">

            {/* Logo */}
            <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors duration-120"
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

            {/* User avatar */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button className="rounded-full focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2">
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarFallback className="bg-brand-shades-500 text-white text-xs font-semibold">
                                {/* TODO: replace with real initials from API */}
                                MC
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                    {/* TODO: replace with real name from API */}
                    Maya Chen
                </TooltipContent>
            </Tooltip>

        </div>
    );
}