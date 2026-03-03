"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

interface TopbarProps {
    title: string;
    description?: string;
    primaryAction?: { label: string; href: string };
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
        <div ref={topbarRef} className="sticky top-0 z-30 w-full bg-black/80 backdrop-blur-xl">
            <div className="border-b border-white/10">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-6 lg:px-10">
                    <div className="flex items-center gap-4">
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
                                className="-ml-1 inline-block text-3xl font-black uppercase italic tracking-tight text-white transition-colors hover:text-brand"
                            >
                                ТУАНЕТ
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {extra}
                        <div className="flex items-center rounded-full border-2 border-white/20 px-4 py-2 text-white">
                            <span className="text-xs font-bold uppercase tracking-normal">{title}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
