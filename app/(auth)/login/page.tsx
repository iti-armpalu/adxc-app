"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDERS = ["YouGov", "Reddit", "X", "QUID", "Census"];

// ─── Brand panel (left) ───────────────────────────────────────────────────────

function BrandPanel() {
    return (
        <aside className="hidden md:grid grid-rows-[auto_1fr_auto] gap-8 bg-brand-600 text-neutral-50 px-14 py-10">

            <div className="flex items-center">
                <Image
                    src="/logo-wordmark.png"
                    alt="ADXC"
                    width={148}
                    height={41}
                    className="h-9 w-auto brightness-0 invert"
                    priority
                />
            </div>

            <div className="flex flex-col self-center max-w-[520px] gap-5">
                <h1 className="m-0 text-[clamp(40px,4.8vw,64px)] leading-[1.02] tracking-[-0.025em] font-bold text-neutral-50">
                    Premium data.<br />
                    <span className="text-brand-200">Pay as you go.</span>
                </h1>
                <p className="m-0 text-[15px] leading-[1.55] text-brand-100 opacity-85 max-w-[460px] tracking-wide">
                    The world's best consumer panels and proprietary datasets, exposed as
                    pay-per-report units. No subscriptions. No seats.
                </p>
            </div>

            <div className="flex flex-col gap-[14px]">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-200 opacity-75">
                    Data providers
                </div>
                <ul className="m-0 p-0 list-none flex flex-wrap items-center gap-[14px] text-neutral-50 text-[15px] font-semibold tracking-tight">
                    {PROVIDERS.map((p, i) => (
                        <li key={p} className="inline-flex items-center gap-[14px]">
                            <span>{p}</span>
                            {i < PROVIDERS.length - 1 && (
                                <span className="text-brand-300 opacity-55 font-normal" aria-hidden="true">·</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

        </aside>
    );
}

// ─── Login form (right) ───────────────────────────────────────────────────────

type FormState = "default" | "loading" | "error" | "success";

function LoginForm() {
    const router = useRouter();
    const [state, setState] = useState<FormState>("default");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    const isError = state === "error";
    const isLoading = state === "loading";
    const isSuccess = state === "success";

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading || isSuccess) return;
        setState("loading");

        try {
            // TODO: swap simulation for real endpoint once Rob confirms auth
            // const res = await fetch("https://api.adxc.ai/v1/auth/login", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ email, password }),
            // });
            // if (!res.ok) throw new Error("Unauthorized");
            // const { token } = await res.json();
            // store token here

            await new Promise(r => setTimeout(r, 1400));
            if (!password || password.length < 4) {
                setState("error");
            } else {
                setState("success");
                setTimeout(() => router.push("/"), 1600);
            }
        } catch {
            setState("error");
        }
    }

    // Success screen
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center w-full">
                <div className="w-full max-w-[400px]" aria-live="polite">
                    <div className="flex flex-col items-center gap-[14px] py-6 animate-adxc-fade">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-success inline-flex items-center justify-center animate-adxc-pop">
                            <Check size={26} />
                        </div>
                        <div className="text-[22px] font-bold tracking-[-0.02em] text-foreground">
                            Signed in
                        </div>
                        <div className="text-sm text-muted-foreground tracking-wide">
                            Loading your dashboard…
                        </div>
                        <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                            <span className="block h-full w-0 bg-primary animate-adxc-fill" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full">
            <form
                className="w-full max-w-[400px] flex flex-col gap-7"
                onSubmit={onSubmit}
                noValidate
            >

                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h2 className="m-0 text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground">
                        Sign in
                    </h2>
                    <p className="m-0 text-sm text-muted-foreground tracking-wide">
                        Welcome back. Use your work email.
                    </p>
                </div>

                {/* Error alert */}
                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle size={16} />
                        <AlertTitle>Invalid email or password</AlertTitle>
                        <AlertDescription>
                            Check your credentials and try again.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Fields */}
                <div className="flex flex-col gap-[14px]">

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">
                            Work email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                            className={cn(isError && "border-destructive focus-visible:ring-destructive")}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPwd ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                                className={cn(
                                    "pr-10",
                                    isError && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPwd(v => !v)}
                                aria-label={showPwd ? "Hide password" : "Show password"}
                                tabIndex={-1}
                                className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader size={16} aria-hidden="true" className="animate-adxc-spin" />
                            <span>Signing in…</span>
                        </>
                    ) : (
                        <span>Sign in</span>
                    )}
                </Button>

                {/* Help */}
                <p className="m-0 text-center text-sm text-muted-foreground tracking-wide">
                    Need access? Contact your ADXC account manager.
                </p>

            </form>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    return (
        <div className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2">

            <BrandPanel />

            <main className="bg-card grid grid-rows-[1fr_auto] p-8 md:p-10">
                <LoginForm />
                <footer className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground tracking-wide">
                    <span>© 2026 ADXC, Inc.</span>
                    <span className="text-border-3" aria-hidden="true">·</span>
                    <Link href="/terms" className="text-muted-foreground no-underline hover:text-primary transition-colors duration-[120ms]">Terms</Link>
                    <span className="text-border-3" aria-hidden="true">·</span>
                    <Link href="/privacy" className="text-muted-foreground no-underline hover:text-primary transition-colors duration-[120ms]">Privacy</Link>
                    <span className="text-border-3" aria-hidden="true">·</span>
                    <Link href="/status" className="text-muted-foreground no-underline hover:text-primary transition-colors duration-[120ms]">Status</Link>
                </footer>
            </main>

        </div>
    );
}