"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Sidebar } from "@/components/account/Sidebar";
import { Topbar } from "@/components/account/Topbar";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AccountShellProps {
    title: string;
    description?: string;
    primaryAction?: { label: string; href: string };
    children: ReactNode;
    quickActions?: { label: string; href: string }[];
    extra?: ReactNode;
}

export function AccountShell({ title, description, primaryAction, children, quickActions, extra }: AccountShellProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white">
            <Topbar
                title={title}
                description={description}
                primaryAction={primaryAction}
                onMenuClick={() => setIsMenuOpen(true)}
                extra={extra}
            />

            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[280px_1fr] lg:px-10">
                <Sidebar />
                <main className="space-y-8 pb-24 lg:pb-0">{children}</main>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden">
                    <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 text-black">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-black uppercase italic">ТУАНЕТ</div>
                            <button
                                type="button"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black/20 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Закрыть меню"
                            >
                                <X className="h-5 w-5" strokeWidth={3} />
                            </button>
                        </div>
                        <div className="mt-6">
                            <Sidebar variant="mobile" onNavigate={() => setIsMenuOpen(false)} />
                        </div>
                    </div>
                </div>
            )}

            {quickActions && quickActions.length > 0 && (
                <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center gap-3 px-4 lg:hidden">
                    {quickActions.slice(0, 3).map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-12 px-4 text-xs uppercase tracking-normal"
                            )}
                        >
                            {action.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
