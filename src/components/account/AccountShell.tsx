"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { BackendAccountPortal } from "@/lib/backend";
import type { AdminSectionKey } from "@/lib/admin-sections";
import { Sidebar } from "@/components/account/Sidebar";
import { Topbar } from "@/components/account/Topbar";
import { buttonVariants } from "@/components/ui/Button";
import { appendPortalQuery } from "@/lib/session-portal";
import { cn } from "@/lib/utils";

interface AccountShellProps {
    title: string;
    description?: string;
    children: ReactNode;
    quickActions?: { label: string; href: string }[];
    extra?: ReactNode;
    accountLabel?: string;
    portal?: BackendAccountPortal;
    staffSectionKeys?: AdminSectionKey[];
    accessStatusText?: string;
    accessStatusTone?: "success" | "danger";
}

export function AccountShell({
    title,
    description,
    children,
    quickActions,
    extra,
    accountLabel,
    portal = "customer",
    staffSectionKeys,
    accessStatusText,
    accessStatusTone,
}: AccountShellProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scopedQuickActions = quickActions?.map((action) => ({
        ...action,
        href: appendPortalQuery(action.href, portal),
    }));

    return (
        <div className="min-h-screen overflow-x-clip bg-black text-white">
            <Topbar
                title={title}
                description={description}
                onMenuClick={() => setIsMenuOpen(true)}
                extra={extra}
            />

            <div className="mx-auto min-w-0 grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-10 lg:py-10">
                <Sidebar
                    accountLabel={accountLabel}
                    portal={portal}
                    staffSectionKeys={staffSectionKeys}
                    accessStatusText={accessStatusText}
                    accessStatusTone={accessStatusTone}
                />
                <main className="min-w-0 space-y-8 pb-36 lg:pb-0">{children}</main>
            </div>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className="absolute left-0 top-0 h-full w-[min(88vw,22rem)] overflow-y-auto rounded-r-[32px] border-r border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-black uppercase italic text-white">ТУАНЕТ</div>
                            <button
                                type="button"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Закрыть меню"
                            >
                                <X className="h-5 w-5" strokeWidth={3} />
                            </button>
                        </div>
                        <div className="mt-6">
                            <Sidebar
                                variant="mobile"
                                accountLabel={accountLabel}
                                portal={portal}
                                staffSectionKeys={staffSectionKeys}
                                accessStatusText={accessStatusText}
                                accessStatusTone={accessStatusTone}
                                onNavigate={() => setIsMenuOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {scopedQuickActions && scopedQuickActions.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-[calc(0.5rem+var(--safe-bottom))] lg:hidden">
                    <div className="mx-auto grid max-w-md grid-cols-2 gap-3 rounded-[28px] border border-white/10 bg-black/75 p-3 backdrop-blur-xl sm:grid-cols-3">
                    {scopedQuickActions.slice(0, 3).map((action, index, actions) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "min-h-11 min-w-0 px-4 text-xs uppercase tracking-normal",
                                actions.length === 3 && index === 2 && "col-span-2 sm:col-span-1"
                            )}
                        >
                            {action.label}
                        </Link>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
