"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DevVariant = "admin" | "org_admin" | "member";

type ShellVariantContextValue = {
    variant: DevVariant;
    setVariant: (v: DevVariant) => void;
};

const ShellVariantContext = createContext<ShellVariantContextValue>({
    variant: "admin",
    setVariant: () => { },
});

export function useShellVariant() {
    return useContext(ShellVariantContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ShellVariantProvider({
    children,
    defaultVariant = "admin",
}: {
    children: React.ReactNode;
    defaultVariant?: DevVariant;
}) {
    const [variant, setVariantState] = useState<DevVariant>(defaultVariant);

    useEffect(() => {
        const stored = localStorage.getItem("dev:shell-variant") as DevVariant | null;
        if (stored === "admin" || stored === "org_admin" || stored === "member") {
            setVariantState(stored);
        }
    }, []);

    function setVariant(v: DevVariant) {
        setVariantState(v);
        localStorage.setItem("dev:shell-variant", v);
    }

    return (
        <ShellVariantContext.Provider value={{ variant, setVariant }}>
            {children}
            <DevVariantToggle />
        </ShellVariantContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Floating toggle
// ---------------------------------------------------------------------------

const VARIANTS: { value: DevVariant; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "org_admin", label: "Org admin" },
    { value: "member", label: "Member" },
];

const VARIANT_HOME: Record<DevVariant, string> = {
    admin: "/admin",
    org_admin: "/organisations/1",
    member: "/organisations/1",
};

function DevVariantToggle() {
    const { variant, setVariant } = useShellVariant();
    const router = useRouter();

    function handleSwitch(v: DevVariant) {
        setVariant(v);
        router.push(VARIANT_HOME[v]);
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-1 bg-neutral-950 border border-neutral-700 rounded-full px-1 py-1 shadow-xl">
            <span className="text-xs text-neutral-500 px-2 font-mono select-none">
                DEV
            </span>
            {VARIANTS.map(({ value, label }) => (
                <button
                    key={value}
                    onClick={() => handleSwitch(value)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${variant === value
                            ? "bg-brand-600 text-white"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}