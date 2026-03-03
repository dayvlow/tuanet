"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, UserRound } from "lucide-react";

const navItems = [
    { href: "/account", label: "Обзор" },
    { href: "/account/keys", label: "Ключи" },
    { href: "/account/devices", label: "Устройства" },
    { href: "/account/security", label: "Безопасность" },
    { href: "/account/profile", label: "Профиль" },
];

interface SidebarProps {
    variant?: "desktop" | "mobile";
    onNavigate?: () => void;
}

export function Sidebar({ variant = "desktop", onNavigate }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "rounded-[36px] border-2 border-zinc-800 bg-zinc-900/70 text-white",
                variant === "desktop"
                    ? "sticky top-[var(--account-topbar-height,0px)] h-full self-stretch w-72 p-6 hidden lg:flex"
                    : "w-full p-6"
            )}
        >
            <div className="flex h-full flex-col gap-6">
                <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-normal text-white/40">Личный кабинет</div>
                    <div className="inline-flex items-center gap-3 rounded-full border-2 border-white/20 px-3 py-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                            <UserRound className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-normal text-white">Алексей</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 [&_.account-nav]:transition-all [&_.account-nav]:duration-150 [&_.account-nav]:hover:!bg-brand [&_.account-nav]:hover:!text-white [&_.account-nav]:hover:!shadow-[0_0_12px_rgba(249,115,22,0.35)] [&_.account-nav:active]:!bg-brand [&_.account-nav:active]:!text-white">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isOverview = item.href === "/account";
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "account-nav flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                                    isActive && !isOverview
                                        ? "!bg-brand !text-white !shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                                        : "text-white/60"
                                )}
                            >
                                <span>{item.label}</span>
                                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto rounded-3xl border-2 border-white/10 bg-black/30 p-4 text-xs uppercase tracking-normal text-white/50">
                    Статус сервиса: <span className="text-white">Online</span>
                </div>
            </div>
        </aside>
    );
}
