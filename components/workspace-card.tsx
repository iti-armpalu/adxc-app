"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Workspace } from "@/lib/mock-data";

function StatusDot({ status }: { status: "active" | "near_cap" | "paused" }) {
    const classes = {
        active: "bg-emerald-500",
        near_cap: "bg-orange-400",
        paused: "bg-neutral-300",
    };
    return (
        <span className={`w-2 h-2 rounded-full shrink-0 ${classes[status]}`} />
    );
}

function MemberInitials({ name }: { name: string }) {
    const parts = name.trim().split(" ");
    const initials =
        parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`
            : parts[0].slice(0, 2);
    return (
        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-semibold shrink-0 ring-2 ring-card">
            {initials.toUpperCase()}
        </div>
    );
}

export function WorkspaceCard({
    id,
    name,
    client,
    status,
    budgetCap,
    budgetUsed,
    memberCount,
    queryCountThisMonth,
    members,
    isNew = false,
}: Workspace) {
    const pct = Math.min(Math.round((budgetUsed / budgetCap) * 100), 100);

    const barColor =
        pct > 95
            ? "bg-red-500"
            : pct >= 80
                ? "bg-orange-500"
                : "bg-brand-600";

    const visibleMembers = members.slice(0, 3);
    const extraCount = memberCount - visibleMembers.length;

    return (
        <Link href={`/admin/workspaces/${id}`}>
            <div className={`rounded-xl border border-neutral-200 bg-card p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 ${isNew ? "animate-adxc-pop" : ""
                }`}>

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={status} />
                        <p className="text-base font-medium text-foreground truncate">
                            {name}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.preventDefault()}
                        >
                            <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                                <MoreHorizontal size={15} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            {/* TODO: wire up edit/pause/archive endpoints */}
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Pause</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Archive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Subtitle */}
                <p className="text-sm text-muted-foreground -mt-2">
                    {client} · {memberCount} member{memberCount !== 1 ? "s" : ""}
                </p>

                {/* Budget */}
                <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            £{budgetUsed.toLocaleString()} of £{budgetCap.toLocaleString()} used
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {/* Member avatars */}
                    <div className="flex items-center">
                        {visibleMembers.map((m) => (
                            <div key={m.id} className="-ml-1 first:ml-0">
                                <MemberInitials name={m.name} />
                            </div>
                        ))}
                        {extraCount > 0 && (
                            <div className="-ml-1 w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-medium ring-2 ring-card">
                                +{extraCount}
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {queryCountThisMonth} quer{queryCountThisMonth === 1 ? "y" : "ies"} this month
                    </span>
                </div>

            </div>
        </Link>
    );
}