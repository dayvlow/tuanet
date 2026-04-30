"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ReferralOverviewCardProps {
    referralCode: string;
    directCount: number;
    level2Count: number;
    bonusAvailable: number;
}

export function ReferralOverviewCard({
    referralCode,
    directCount,
    level2Count,
    bonusAvailable,
}: ReferralOverviewCardProps) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function transferBonus() {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/referrals/transfer", {
                        method: "POST",
                    });
                    const payload = (await response.json().catch(() => ({}))) as { detail?: string; transferred_amount?: number };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось перевести бонус");
                    }

                    setMessage(`Перевели на баланс ${Number(payload.transferred_amount ?? 0).toFixed(2)} ₽.`);
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось перевести бонус"
                    );
                }
            })();
        });
    }

    return (
        <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="text-xs font-bold uppercase tracking-normal text-white/40">Рефералка</div>
            <div className="mt-4 text-3xl font-black uppercase tracking-tight">
                {directCount} прямых
            </div>
            <div className="text-sm text-white/60">
                2-й уровень: {level2Count} • Доступно бонусов: {bonusAvailable.toFixed(2)} ₽
            </div>
            <div className="mt-4 rounded-2xl border-2 border-white/10 bg-black/20 p-4 text-sm text-white/70">
                Реферальный код: <span className="font-bold text-white">{referralCode}</span>
            </div>

            {message && (
                <div className="mt-4 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(referralCode)}
                    className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-10 px-4 text-xs uppercase tracking-normal border-2"
                    )}
                >
                    Копировать код
                </button>
                <button
                    type="button"
                    onClick={transferBonus}
                    disabled={isPending || bonusAvailable <= 0}
                    className={cn(
                        buttonVariants({ variant: "brand", size: "sm" }),
                        "h-10 px-4 text-xs uppercase tracking-normal disabled:opacity-60"
                    )}
                >
                    {isPending ? "Переводим..." : "Перевести на баланс"}
                </button>
            </div>
        </div>
    );
}
