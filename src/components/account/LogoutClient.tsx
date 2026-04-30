"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BackendAccountPortal } from "@/lib/backend";
import { buttonVariants } from "@/components/ui/Button";
import { appendPortalQuery } from "@/lib/session-portal";
import { cn } from "@/lib/utils";

interface LogoutClientProps {
    portal?: BackendAccountPortal | null;
    nextHref?: string | null;
}

export function LogoutClient({ portal = null, nextHref = null }: LogoutClientProps) {
    const router = useRouter();
    const loginHref = appendPortalQuery("/login", portal);
    const logoutApiHref = appendPortalQuery("/api/auth/logout", portal);

    useEffect(() => {
        void fetch(logoutApiHref, { method: "POST" }).finally(() => {
            if (nextHref) {
                router.replace(nextHref);
                return;
            }
            router.refresh();
        });
    }, [logoutApiHref, nextHref, router]);

    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <div className="mx-auto max-w-3xl text-center px-6">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">
                    {nextHref ? "Сессия завершена" : "Вы вышли"}
                </h1>
                <p className="text-2xl text-white/60 mt-6">
                    {nextHref
                        ? "Аккаунт больше недоступен. Возвращаем на главную страницу."
                        : "Если захочешь, всегда можно войти снова."}
                </p>
                {!nextHref && (
                    <div className="mt-10">
                        <Link
                            href={loginHref}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "h-16 px-12 rounded-3xl uppercase tracking-widest text-sm font-bold"
                            )}
                        >
                            Вернуться ко входу
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
