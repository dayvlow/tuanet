"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";
import { getInstructionHref, normalizeInstallConfigHref } from "@/lib/backend";
import { cn } from "@/lib/utils";

function ConnectPageContent() {
    const searchParams = useSearchParams();
    const config = normalizeInstallConfigHref(searchParams.get("config"));
    const platform = searchParams.get("platform");
    const instructionHref = getInstructionHref(platform);

    useEffect(() => {
        if (!config) {
            return;
        }

        const timer = window.setTimeout(() => {
            window.location.href = config;
        }, 300);

        return () => window.clearTimeout(timer);
    }, [config]);

    return (
        <div className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl rounded-[32px] border-2 border-zinc-800 bg-zinc-900/80 p-6 sm:rounded-[36px] sm:p-8">
                <div className="mb-6 w-[148px] sm:w-[176px]">
                    <BrandLogo title="TUANET" className="text-white" />
                </div>
                <div className="text-xs font-bold uppercase tracking-normal text-white/40">Подключение устройства</div>
                <h1 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl">Открываем ключ в приложении</h1>
                <p className="mt-4 text-base text-white/70 sm:text-lg">
                    Если приложение уже установлено, импорт начнётся автоматически. Если нет, открой инструкцию и установи приложение вручную.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {config && (
                        <a
                            href={config}
                            className={cn(buttonVariants({ variant: "brand", size: "sm" }), "min-h-12 px-5 text-xs uppercase tracking-normal")}
                        >
                            Открыть ключ
                        </a>
                    )}
                    <Link
                        href={instructionHref}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-12 px-5 text-xs uppercase tracking-normal border-2")}
                    >
                        Инструкция
                    </Link>
                    <Link
                        href="/account/devices"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-12 px-5 text-xs uppercase tracking-normal")}
                    >
                        Вернуться в кабинет
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ConnectPage() {
    return (
        <Suspense fallback={null}>
            <ConnectPageContent />
        </Suspense>
    );
}
