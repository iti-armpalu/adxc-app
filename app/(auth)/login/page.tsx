"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Check, Loader } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDERS = ["YouGov", "Reddit", "X", "QUID", "Census"];

// ─── Brand panel (left) ───────────────────────────────────────────────────────

function BrandPanel() {
    return (
        <aside className="hidden md:grid grid-rows-[auto_1fr_auto] gap-8 bg-brand text-brand-neutrals-50 px-14 py-10">

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
                <h1 className="m-0 text-[clamp(40px,4.8vw,64px)] leading-[1.02] tracking-[-0.025em] font-bold text-brand-neutrals-50">
                    Premium data.<br />
                    <span className="text-brand-shades-200">Pay as you go.</span>
                </h1>
                <p className="m-0 text-[15px] leading-[1.55] text-brand-shades-100 opacity-85 max-w-[460px] tracking-wide">
                    The world's best consumer panels and proprietary datasets, exposed as
                    pay-per-report units. No subscriptions. No seats.
                </p>
            </div>

            <div className="flex flex-col gap-[14px]">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-shades-200 opacity-75">
                    Data providers
                </div>
                <ul className="m-0 p-0 list-none flex flex-wrap items-center gap-[14px] text-brand-neutrals-50 text-[15px] font-semibold tracking-tight">
                    {PROVIDERS.map((p, i) => (
                        <li key={p} className="inline-flex items-center gap-[14px]">
                            <span>{p}</span>
                            {i < PROVIDERS.length - 1 && (
                                <span className="text-brand-shades-300 opacity-55 font-normal" aria-hidden="true">·</span>
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
    const [emailFocus, setEmailFocus] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

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

    function fieldClass(active: boolean) {
        const base = "flex items-center h-11 bg-card border rounded-[2px] transition-all duration-[120ms]";
        if (isError) return `${base} border-destructive shadow-[0_0_0_2px] shadow-destructive-subtle`;
        if (active) return `${base} border-primary shadow-[0_0_0_2px] shadow-ring`;
        return `${base} border-border`;
    }

    const inputClass = "flex-1 min-w-0 h-full px-3 bg-transparent border-none outline-none font-sans text-sm text-foreground tracking-wide placeholder:text-muted-foreground disabled:opacity-50";

    // Success screen
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center w-full">
                <div className="w-full max-w-[400px]" aria-live="polite">
                    <div
                        className="flex flex-col items-center gap-[14px] py-6"
                        style={{ animation: "adxc-fade 240ms ease" }}
                    >
                        <div
                            className="w-14 h-14 rounded-full bg-emerald-100 text-success inline-flex items-center justify-center"
                            style={{ animation: "adxc-pop 260ms ease" }}
                        >
                            <Check size={26} />
                        </div>
                        <div className="text-[22px] font-bold tracking-[-0.02em] text-foreground">
                            Signed in
                        </div>
                        <div className="text-[13px] text-muted-foreground tracking-wide">
                            Loading your dashboard…
                        </div>
                        <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                            <span
                                className="block h-full w-0 bg-primary"
                                style={{ animation: "adxc-fill 1.4s ease forwards" }}
                            />
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
                    <p className="m-0 text-sm leading-[1.5] text-muted-foreground tracking-wide">
                        Welcome back. Use your work email.
                    </p>
                </div>

                {/* Error alert */}
                {isError && (
                    <div
                        role="alert"
                        className="flex gap-2.5 px-3.5 py-3 bg-destructive-subtle border border-destructive-border rounded-sm"
                    >
                        <AlertCircle size={16} className="text-destructive mt-[1px] shrink-0" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-[13px] font-semibold tracking-[-0.01em] leading-[1.3] text-red-700">
                                Invalid email or password
                            </div>
                            <div className="text-xs leading-[1.5] text-red-700 opacity-85">
                                Check your credentials and try again.
                            </div>
                        </div>
                    </div>
                )}

                {/* Fields */}
                <div className="flex flex-col gap-[14px]">

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold tracking-[-0.01em] text-foreground">
                            Work email
                        </span>
                        <div className={fieldClass(emailFocus)}>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setEmailFocus(true)}
                                onBlur={() => setEmailFocus(false)}
                                disabled={isLoading}
                                className={inputClass}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold tracking-[-0.01em] text-foreground">
                            Password
                        </span>
                        <div className={fieldClass(pwdFocus)}>
                            <input
                                type={showPwd ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setPwdFocus(true)}
                                onBlur={() => setPwdFocus(false)}
                                disabled={isLoading}
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(v => !v)}
                                aria-label={showPwd ? "Hide password" : "Show password"}
                                tabIndex={-1}
                                className="inline-flex items-center justify-center w-9 h-full bg-transparent border-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </label>

                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-5 bg-primary text-primary-foreground border border-primary rounded-xs text-sm font-semibold tracking-[-0.01em] cursor-pointer transition-all duration-[120ms] hover:bg-primary-hover hover:border-primary-hover active:bg-brand-shades-800 active:border-brand-shades-800 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-90"
                >
                    {isLoading ? (
                        <>
                            <Loader
                                size={16}
                                aria-hidden="true"
                                style={{ animation: "adxc-spin 0.8s linear infinite" }}
                            />
                            <span>Signing in…</span>
                        </>
                    ) : (
                        <span>Sign in</span>
                    )}
                </button>

                {/* Help */}
                <p className="m-0 text-center text-[13px] leading-[1.5] text-muted-foreground tracking-wide">
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