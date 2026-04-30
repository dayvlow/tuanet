"use client";

import { useMemo, useState, useTransition } from "react";

import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { BackendTopupPaymentResponse } from "@/lib/backend";

const PRESET_AMOUNTS = [100, 300, 500, 1000, 3000];
const MIN_TOPUP_AMOUNT = 50;

interface BalanceTopupActionProps {
    defaultPromoCode?: string | null;
    triggerLabel?: string;
    triggerClassName?: string;
}

function getTopupErrorMessage(detail?: string): string {
    if (detail === "topup_already_processing") {
        return "Платёж уже создаётся. Подожди пару секунд и попробуй снова.";
    }
    return detail || "Не удалось создать платёж";
}

export function BalanceTopupAction({
    defaultPromoCode,
    triggerLabel = "Пополнить баланс",
    triggerClassName,
}: BalanceTopupActionProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("100");
    const [paymentMethod] = useState("yookassa");
    const [promoCode, setPromoCode] = useState(defaultPromoCode ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const numericAmount = useMemo(() => Number(amount), [amount]);

    function openModal() {
        setPromoCode(defaultPromoCode ?? "");
        setOpen(true);
        setError(null);
    }

    function closeModal() {
        if (isPending) {
            return;
        }
        setOpen(false);
        setError(null);
    }

    function submitTopup() {
        startTransition(() => {
            void (async () => {
                try {
                    setError(null);

                    if (!Number.isFinite(numericAmount) || numericAmount < MIN_TOPUP_AMOUNT) {
                        throw new Error(`Минимальная сумма пополнения — ${MIN_TOPUP_AMOUNT} ₽.`);
                    }

                    const response = await fetch("/api/payments/topups", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            amount: numericAmount,
                            payment_method: paymentMethod,
                            promo_code: promoCode.trim() || undefined,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as
                        | BackendTopupPaymentResponse
                        | { detail?: string };

                    if (!response.ok || !("payment" in payload)) {
                        throw new Error(
                            getTopupErrorMessage("detail" in payload ? payload.detail : undefined)
                        );
                    }

                    if (!payload.payment.confirmation_url) {
                        throw new Error("ЮKassa не вернула ссылку на оплату.");
                    }

                    window.location.assign(payload.payment.confirmation_url);
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось создать платёж"
                    );
                }
            })();
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className={cn(
                    buttonVariants({ variant: "brand", size: "sm" }),
                    "h-10 px-4 text-xs uppercase tracking-normal",
                    triggerClassName,
                )}
            >
                {triggerLabel}
            </button>

            <Modal
                open={open}
                title="Пополнение баланса"
                onClose={closeModal}
                size="lg"
                footer={(
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={submitTopup}
                            disabled={isPending}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-12 px-6 text-xs uppercase tracking-normal disabled:opacity-60",
                            )}
                        >
                            {isPending ? "Создаём платёж..." : "Перейти к оплате"}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isPending}
                            className="h-12 rounded-full border-2 border-black/15 px-6 text-xs font-bold uppercase tracking-normal text-black/60 transition hover:bg-black/5 disabled:opacity-60"
                        >
                            Отмена
                        </button>
                    </div>
                )}
            >
                <div className="grid gap-6">
                    <div className="rounded-3xl border-2 border-black/10 bg-black/[0.03] p-5">
                        <div className="text-xs font-bold uppercase tracking-normal text-black/40">Способ оплаты</div>
                        <div className="mt-3 flex items-center justify-between rounded-2xl border-2 border-brand/20 bg-brand/5 px-4 py-3">
                            <div>
                                <div className="text-lg font-black uppercase tracking-tight text-black">ЮKassa</div>
                                <div className="text-sm text-black/55">Оплата через ЮKassa банковской картой и checkout.</div>
                            </div>
                            <span className="rounded-full border-2 border-brand/20 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-black">
                                активен
                            </span>
                        </div>
                    </div>

                    <div className="rounded-3xl border-2 border-black/10 bg-black/[0.03] p-5">
                        <div className="text-xs font-bold uppercase tracking-normal text-black/40">Сумма пополнения</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {PRESET_AMOUNTS.map((presetAmount) => (
                                <button
                                    key={presetAmount}
                                    type="button"
                                    onClick={() => setAmount(String(presetAmount))}
                                    className={cn(
                                        "rounded-full border-2 px-4 py-2 text-sm font-bold uppercase tracking-normal transition",
                                        Number(amount) === presetAmount
                                            ? "border-black bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                                            : "border-black/10 bg-white text-black hover:bg-black/5",
                                    )}
                                >
                                    {presetAmount} ₽
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 grid gap-2">
                            <label className="text-sm font-semibold text-black/70" htmlFor="topup-amount">
                                Или введи свою сумму
                            </label>
                            <input
                                id="topup-amount"
                                type="number"
                                min={MIN_TOPUP_AMOUNT}
                                step="1"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="h-12 rounded-2xl border-2 border-black/10 bg-white px-4 font-semibold text-black"
                            />
                            <div className="text-xs text-black/45">
                                Минимальная сумма пополнения — {MIN_TOPUP_AMOUNT} ₽.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border-2 border-black/10 bg-black/[0.03] p-5">
                        <label className="grid gap-2" htmlFor="topup-promo-code">
                            <span className="text-xs font-bold uppercase tracking-normal text-black/40">Промокод</span>
                            <input
                                id="topup-promo-code"
                                type="text"
                                value={promoCode}
                                onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                                placeholder="Если есть промокод — введи его здесь"
                                className="h-12 rounded-2xl border-2 border-black/10 bg-white px-4 font-semibold uppercase text-black placeholder:text-black/35"
                            />
                        </label>
                        <div className="mt-2 text-xs text-black/45">
                            Поле есть всегда, но код можно оставить пустым. Если у тебя уже активирован бонусный промокод, он подставится автоматически.
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
