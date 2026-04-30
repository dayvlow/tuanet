"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { BackendPromo } from "@/lib/backend";

interface PromoActivationCardProps {
    activePromo: BackendPromo | null;
    availablePromos: BackendPromo[];
}

function translatePromoError(detail: string): string {
    switch (detail) {
        case "promo_code_required":
            return "Введи код промокода.";
        case "promo_not_found":
            return "Такой промокод не найден.";
        case "promo_not_active":
            return "Этот промокод уже недоступен.";
        case "promo_already_used":
            return "Этот промокод уже был использован.";
        case "promo_limit_reached":
            return "Лимит активаций этого промокода уже исчерпан.";
        case "promo_amount_too_low":
            return "Сумма пополнения слишком маленькая для этого промокода.";
        case "promo_amount_too_high":
            return "Сумма пополнения слишком большая для этого промокода.";
        case "promo_type_not_supported_for_topup":
            return "Этот промокод нельзя применить к пополнению.";
        default:
            return detail;
    }
}

export function PromoActivationCard({ activePromo, availablePromos }: PromoActivationCardProps) {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPromo, setSelectedPromo] = useState<BackendPromo | null>(null);
    const [isPending, startTransition] = useTransition();

    const promoCards = useMemo(
        () => availablePromos.slice(0, 6),
        [availablePromos]
    );

    function activatePromoCode(nextCode: string, options?: { closeModal?: boolean }) {
        startTransition(() => {
            void (async () => {
                try {
                    setError(null);
                    setMessage(null);
                    const normalizedCode = nextCode.trim().toUpperCase();

                    const response = await fetch("/api/promos/activate", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ code: normalizedCode }),
                    });

                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось активировать промокод");
                    }

                    setMessage("Промокод активирован. Обновляю данные аккаунта…");
                    setCode("");
                    if (options?.closeModal) {
                        setSelectedPromo(null);
                    }
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? translatePromoError(requestError.message)
                            : "Не удалось активировать промокод"
                    );
                }
            })();
        });
    }

    function activatePromo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        activatePromoCode(code);
    }

    function formatPromoValue(promo: BackendPromo): string {
        return promo.promo_type === "balance_credit"
            ? `+${promo.bonus.toFixed(2)} ₽ сразу на баланс`
            : `+${promo.bonus}% к следующему пополнению`;
    }

    function formatPromoWindow(value: string | null): string {
        if (!value) {
            return "Без ограничения";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Без ограничения";
        }

        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function formatPromoAmountRange(promo: BackendPromo): string {
        if (promo.promo_type === "balance_credit") {
            return "Применяется сразу после подтверждения";
        }

        const maxAmount = promo.max_amount > 0 ? `${promo.max_amount.toFixed(2)} ₽` : "без верхнего лимита";
        return `Сумма пополнения: от ${promo.min_amount.toFixed(2)} ₽ до ${maxAmount}`;
    }

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Промокоды</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">
                        Активируй промокоды и получай бонусы к пополнению.
                    </p>
                </div>

                {activePromo ? (
                    <div className="rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/10 p-5">
                        <div className="text-xs font-bold uppercase tracking-normal text-emerald-300">
                            Активный промокод
                        </div>
                        <div className="mt-2 text-3xl font-black tracking-tight">{activePromo.code}</div>
                        <div className="mt-2 text-sm text-white/70">
                            {activePromo.promo_type === "balance_credit"
                                ? `Начисление: +${activePromo.bonus.toFixed(2)} ₽ сразу на баланс`
                                : `Бонус: +${activePromo.bonus}% • Диапазон оплаты: ${activePromo.min_amount.toFixed(2)} ₽ - ${activePromo.max_amount > 0 ? activePromo.max_amount.toFixed(2) : "∞"} ₽`}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-5 text-sm text-white/70">
                        Сейчас активного промокода нет. Можно активировать новый ниже.
                    </div>
                )}

                {promoCards.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {promoCards.map((promo) => (
                            <button
                                key={promo.code}
                                type="button"
                                onClick={() => setSelectedPromo(promo)}
                                className="rounded-3xl border-2 border-white/12 bg-white/[0.04] px-4 py-4 text-left transition hover:border-brand/40 hover:bg-brand/10"
                            >
                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                                    Промокод
                                </div>
                                <div className="mt-2 text-lg font-black uppercase tracking-tight">{promo.code}</div>
                                <div className="mt-2 text-sm font-semibold text-white/75">
                                    {formatPromoValue(promo)}
                                </div>
                                <div className="mt-3 text-xs font-medium uppercase tracking-normal text-white/40">
                                    Нажми, чтобы посмотреть условия
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-5 text-sm text-white/70">
                        Все доступные промокоды для этого аккаунта уже использованы или сейчас недоступны.
                    </div>
                )}

                <form className="grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={activatePromo}>
                    <input
                        type="text"
                        value={code}
                        onChange={(event) => setCode(event.target.value.toUpperCase())}
                        placeholder="Введи код, например SPRING50"
                        className="h-12 rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold placeholder:text-white/35"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !code.trim()}
                        className={cn(
                            buttonVariants({ variant: "brand", size: "sm" }),
                            "h-12 px-6 text-xs uppercase tracking-normal disabled:opacity-60"
                        )}
                    >
                        {isPending ? "Активируем..." : "Активировать"}
                    </button>
                </form>

                {message && (
                    <div className="rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}
            </div>

            <Modal
                open={Boolean(selectedPromo)}
                onClose={() => setSelectedPromo(null)}
                title={selectedPromo?.code ?? "Промокод"}
                size="sm"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={isPending || !selectedPromo}
                            onClick={() => {
                                if (selectedPromo) {
                                    activatePromoCode(selectedPromo.code, { closeModal: true });
                                }
                            }}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal !text-black hover:!text-black active:!text-black disabled:opacity-60"
                            )}
                        >
                            {isPending ? "Применяем..." : "Применить"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPromo(null)}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border-2 border-black/10 px-6 text-xs font-bold uppercase tracking-normal text-black transition hover:border-black/25 hover:bg-black/5"
                        >
                            Закрыть
                        </button>
                    </div>
                }
            >
                {selectedPromo && (
                    <div className="space-y-4">
                        <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-5">
                            <div className="text-xs font-bold uppercase tracking-normal text-black/45">Что даёт</div>
                            <div className="mt-2 text-xl font-black tracking-tight text-black">
                                {formatPromoValue(selectedPromo)}
                            </div>
                            <div className="mt-2 text-sm text-black/65">
                                {selectedPromo.promo_type === "balance_credit"
                                    ? "После применения сумма сразу поступит на баланс."
                                    : "После применения код будет ожидать следующее пополнение и добавит бонус к оплате."}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border-2 border-black/10 bg-white p-4">
                                <div className="text-xs font-bold uppercase tracking-normal text-black/45">Условия</div>
                                <div className="mt-2 text-sm font-semibold text-black/75">
                                    {formatPromoAmountRange(selectedPromo)}
                                </div>
                            </div>

                            <div className="rounded-3xl border-2 border-black/10 bg-white p-4">
                                <div className="text-xs font-bold uppercase tracking-normal text-black/45">Период действия</div>
                                <div className="mt-2 text-sm font-semibold text-black/75">
                                    {formatPromoWindow(selectedPromo.start_date)} - {formatPromoWindow(selectedPromo.end_date)}
                                </div>
                            </div>
                        </div>

                        {(selectedPromo.max_bonus_amount > 0 || selectedPromo.activation_limit > 0) && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-3xl border-2 border-black/10 bg-white p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Максимальный бонус</div>
                                    <div className="mt-2 text-sm font-semibold text-black/75">
                                        {selectedPromo.max_bonus_amount > 0
                                            ? `${selectedPromo.max_bonus_amount.toFixed(2)} ₽`
                                            : "Без ограничения"}
                                    </div>
                                </div>

                                <div className="rounded-3xl border-2 border-black/10 bg-white p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Лимит активаций</div>
                                    <div className="mt-2 text-sm font-semibold text-black/75">
                                        {selectedPromo.activation_limit > 0
                                            ? `${selectedPromo.activation_limit} активаций`
                                            : "Без ограничения"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </section>
    );
}
