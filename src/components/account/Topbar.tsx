"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";

interface TopbarProps {
    title: string;
    description?: string;
    onMenuClick?: () => void;
    extra?: ReactNode;
}

export function Topbar({ title, onMenuClick, extra }: TopbarProps) {
    const topbarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function setTopbarHeight() {
            if (topbarRef.current) {
                const h = topbarRef.current.offsetHeight;
                document.documentElement.style.setProperty("--account-topbar-height", `${h}px`);
            }
        }

        setTopbarHeight();
        window.addEventListener("resize", setTopbarHeight);
        return () => window.removeEventListener("resize", setTopbarHeight);
    }, []);

    return (
        <div ref={topbarRef} className="sticky top-0 z-30 w-full overflow-x-clip bg-black/80 backdrop-blur-xl">
            <div className="border-b border-white/10">
                <div className="mx-auto flex min-w-0 max-w-[1400px] items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 sm:py-5 lg:px-10 lg:gap-4 lg:py-6">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <button
                            type="button"
                            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            aria-label="Открыть меню"
                            onClick={onMenuClick}
                        >
                            <Menu className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                        <div>
                            <Link
                                href="/"
                                aria-label="Туанет"
                                className="-ml-1 inline-block w-[7.5rem] text-white transition-colors hover:text-brand sm:w-[9rem]"
                            >
                                <BrandLogo />
                            </Link>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        {extra}
                        <div className="min-w-0 text-right text-white">
                            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 sm:text-[11px]">
                                Раздел
                            </div>
                            <div className="truncate text-sm font-black uppercase tracking-tight sm:text-base lg:text-lg">
                                {title}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
