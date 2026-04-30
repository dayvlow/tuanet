"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BackendAccountPortal } from "@/lib/backend";
import { ADMIN_SECTIONS, type AdminSectionKey } from "@/lib/admin-sections";
import { appendPortalQuery } from "@/lib/session-portal";
import { cn } from "@/lib/utils";
import { ArrowRight, UserRound } from "lucide-react";

const customerNavItems = [
    { href: "/account/devices", label: "Устройства" },
    { href: "/account/payments", label: "Платежи" },
    { href: "/account/security", label: "Безопасность" },
];

const partnerNavItems = [
    { href: "/account/partner", label: "Партнёрка" },
    { href: "/account/partner/finance", label: "Финансы" },
    { href: "/account/profile", label: "Профиль" },
];

interface SidebarProps {
    variant?: "desktop" | "mobile";
    onNavigate?: () => void;
    accountLabel?: string;
    portal?: BackendAccountPortal;
    staffSectionKeys?: AdminSectionKey[];
    accessStatusText?: string;
    accessStatusTone?: "success" | "danger";
}

export function Sidebar({
    variant = "desktop",
    onNavigate,
    accountLabel,
    portal = "customer",
    staffSectionKeys,
    accessStatusText = "Online",
    accessStatusTone = "success",
}: SidebarProps) {
    const pathname = usePathname();
    const isProfileActive = pathname === "/account/profile";
    const desktopStyle = variant === "desktop"
        ? { top: "var(--account-topbar-height, 0px)" }
        : undefined;
    const visibleStaffNavItems = ADMIN_SECTIONS
        .filter((section) => !staffSectionKeys || staffSectionKeys.includes(section.key))
        .map((section) => ({ href: section.href, label: section.label }));
    const navItems = portal === "staff"
        ? [...visibleStaffNavItems, { href: "/account/profile", label: "Профиль" }]
        : portal === "partner"
            ? partnerNavItems
            : customerNavItems;
    const profileHref = appendPortalQuery("/account/profile", portal);
    const logoutHref = appendPortalQuery("/logout", portal);
    const cabinetLabel = portal === "staff"
        ? "Staff кабинет"
        : portal === "partner"
            ? "Партнёрский кабинет"
            : "Личный кабинет";

    return (
        <aside
            style={desktopStyle}
            className={cn(
                "rounded-[36px] border-2 border-zinc-800 bg-zinc-900/70 text-white",
                variant === "desktop"
                    ? "sticky h-full self-stretch w-72 p-6 hidden lg:flex"
                    : "w-full p-5 sm:p-6"
            )}
        >
            <div className="flex h-full flex-col gap-6">
                <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-normal text-white/40">{cabinetLabel}</div>
                    <Link
                        href={profileHref}
                        onClick={onNavigate}
                        aria-current={isProfileActive ? "page" : undefined}
                        className={cn(
                            "inline-flex items-center gap-3 rounded-full border-2 px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                            isProfileActive
                                ? "border-brand bg-brand/10 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                                : "border-white/20 text-white hover:border-brand/60 hover:bg-brand/10"
                        )}
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                            <UserRound className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-normal text-white">{accountLabel ?? "Аккаунт"}</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 [&_.account-nav]:transition-all [&_.account-nav]:duration-150">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={appendPortalQuery(item.href, portal)}
                                onClick={onNavigate}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "account-nav flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                                    isActive
                                        ? "bg-brand text-white shadow-[0_0_10px_rgba(249,115,22,0.28)]"
                                        : "text-white/60 hover:bg-white/6 hover:text-white"
                                )}
                            >
                                <span>{item.label}</span>
                                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                            </Link>
                        );
                    })}
                </nav>

                {portal !== "customer" && (
                    <div className="mt-auto rounded-3xl border-2 border-white/10 bg-black/30 p-4 text-xs uppercase tracking-normal text-white/50">
                        {portal === "staff" ? "Внутренний доступ" : "Партнёрский доступ"}:{" "}
                        <span className={cn(accessStatusTone === "danger" ? "text-red-300" : "text-white")}>
                            {accessStatusText}
                        </span>
                    </div>
                )}
                <Link
                    href={logoutHref}
                    onClick={onNavigate}
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-normal text-white/70 transition hover:border-white/20 hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    Выйти
                </Link>
            </div>
        </aside>
    );
}
