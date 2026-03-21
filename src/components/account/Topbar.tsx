"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { accountBalanceFixture } from "@/lib/account-fixtures";
import { Modal } from "@/components/account/Modal";
import { AccountBalanceInfo } from "@/lib/account-types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mapBalanceRecord } from "@/lib/account-utils";

interface TopbarProps {
    title: string;
    description?: string;
    primaryAction?: { label: string; href: string };
    onMenuClick?: () => void;
    extra?: ReactNode;
}

export function Topbar({ title, onMenuClick, extra }: TopbarProps) {
    const topbarRef = useRef<HTMLDivElement | null>(null);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [balance, setBalance] = useState<AccountBalanceInfo>(accountBalanceFixture);
    const supabase = useMemo(
        () => (isSupabaseConfigured() ? createClient() : null),
        []
    );

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

    useEffect(() => {
        const client = supabase;

        if (!client) {
            return;
        }

        const supabaseClient = client;

        let cancelled = false;

        async function loadBalance() {
            const {
                data: { user },
            } = await supabaseClient.auth.getUser();

            if (!user) {
                return;
            }

            const { data } = await supabaseClient
                .from("account_profiles")
                .select("balance_amount, balance_currency, balance_updated_at")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!cancelled && data) {
                setBalance(mapBalanceRecord(data, accountBalanceFixture));
            }
        }

        void loadBalance();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    return (
        <>
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
                            <button
                                type="button"
                                onClick={() => setIsBalanceModalOpen(true)}
                                className="flex items-center rounded-full border-2 border-white/60 px-3 py-1.5 text-white transition hover:border-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:px-4 sm:py-2"
                                aria-label={`Баланс аккаунта ${balance.amount} ${balance.currency}. Открыт раздел ${title}.`}
                            >
                                <span className="text-sm font-black tracking-tight sm:text-base lg:text-lg">
                                    Баланс: {balance.amount} {balance.currency}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={isBalanceModalOpen}
                title="Пополнить баланс"
                onClose={() => {
                    setIsBalanceModalOpen(false);
                    setSelectedMethod(null);
                }}
                size="sm"
            >
                <div className="grid gap-3">
                    {[
                        {
                            title: "Банковская карта",
                            description: "Обычное пополнение с карты без лишних шагов.",
                        },
                        {
                            title: "СБП",
                            description: "Перевод через приложение банка по короткому сценарию.",
                        },
                        {
                            title: "Криптовалюта",
                            description: "Пополнение через доступные сети с подтверждением в поддержке.",
                        },
                    ].map((method) => (
                        <button
                            key={method.title}
                            type="button"
                            onClick={() => setSelectedMethod(method.title)}
                            className="rounded-[24px] border-2 border-black/10 bg-black/[0.03] px-5 py-4 text-left transition hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            <div className="text-lg font-black uppercase tracking-tight">{method.title}</div>
                            <div className="mt-1 text-sm text-black/60">{method.description}</div>
                        </button>
                    ))}
                    {selectedMethod && (
                        <div className="rounded-[24px] border-2 border-black/10 bg-black/[0.03] p-5">
                            <div className="text-sm font-bold uppercase tracking-normal text-black/50">Выбран способ</div>
                            <div className="mt-2 text-xl font-black uppercase tracking-tight">{selectedMethod}</div>
                            <p className="mt-3 text-sm text-black/60">
                                Для завершения перейди в поддержку. Там подскажут актуальные реквизиты и дальнейшие шаги.
                            </p>
                            <a
                                href="mailto:support@tuaanet.com?subject=Пополнение%20баланса"
                                className="mt-4 inline-flex rounded-full border-2 border-black/20 px-4 py-2 text-xs font-bold uppercase tracking-normal text-black transition hover:bg-black/5"
                            >
                                Связаться с поддержкой
                            </a>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
