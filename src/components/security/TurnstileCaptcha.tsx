"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ?? "";
const TURNSTILE_SCRIPT_ID = "tuanet-turnstile-script";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                },
            ) => string | number;
            reset: (widgetId?: string | number) => void;
        };
    }
}

interface TurnstileCaptchaProps {
    onTokenChange: (token: string | null) => void;
    resetSignal?: number;
}

export function TurnstileCaptcha({ onTokenChange, resetSignal = 0 }: TurnstileCaptchaProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | number | null>(null);
    const [scriptReady, setScriptReady] = useState(false);
    const onTokenChangeRef = useRef(onTokenChange);

    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY) {
            return;
        }
        if (window.turnstile) {
            setScriptReady(true);
            return;
        }

        let cancelled = false;
        let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
        const handleLoad = () => {
            if (!cancelled) {
                setScriptReady(true);
            }
        };

        if (!script) {
            script = document.createElement("script");
            script.id = TURNSTILE_SCRIPT_ID;
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.addEventListener("load", handleLoad, { once: true });
            document.head.appendChild(script);
        } else if (window.turnstile) {
            setScriptReady(true);
        } else {
            script.addEventListener("load", handleLoad, { once: true });
        }

        const pollId = window.setInterval(() => {
            if (window.turnstile) {
                window.clearInterval(pollId);
                handleLoad();
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearInterval(pollId);
            script?.removeEventListener("load", handleLoad);
        };
    }, []);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY || !scriptReady || !containerRef.current || !window.turnstile) {
            return;
        }
        if (widgetIdRef.current !== null) {
            return;
        }

        try {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                theme: "dark",
                callback: (token: string) => onTokenChangeRef.current(token),
                "expired-callback": () => onTokenChangeRef.current(null),
                "error-callback": () => onTokenChangeRef.current(null),
            });
        } catch {
            onTokenChangeRef.current(null);
        }
    }, [scriptReady]);

    useEffect(() => {
        if (!window.turnstile || widgetIdRef.current === null) {
            return;
        }
        window.turnstile.reset(widgetIdRef.current);
        onTokenChangeRef.current(null);
    }, [resetSignal]);

    if (!TURNSTILE_SITE_KEY) {
        return null;
    }

    return (
        <div className="rounded-2xl border-2 border-white/10 bg-white/[0.03] p-4">
            <div ref={containerRef} />
        </div>
    );
}
