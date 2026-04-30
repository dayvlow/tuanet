"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { BackendPayment, BackendTopupPaymentStatusResponse } from "@/lib/backend";

interface TopupReturnBannerProps {
    paymentRef: string;
}

function getStatusCopy(payment: BackendPayment | null) {
    if (!payment) {
        return {
            tone: "amber" as const,
            title: "Проверяем платёж",
            description: "Запрашиваю актуальный статус оплаты у ЮKassa.",
        };
    }

    const normalizedStatus = payment.status.toLowerCase();
    if (normalizedStatus === "succeeded") {
        return {
            tone: "emerald" as const,
            title: "Платёж подтверждён",
            description: payment.bonus_amount > 0
                ? `На баланс зачислено ${payment.credited_amount.toFixed(2)} ₽, включая бонус ${payment.bonus_amount.toFixed(2)} ₽.`
                : `На баланс зачислено ${payment.amount.toFixed(2)} ₽.`,
        };
    }

    if (normalizedStatus === "pending") {
        return {
            tone: "amber" as const,
            title: "Платёж ещё обрабатывается",
            description: "Если оплата уже завершена в ЮKassa, обнови страницу через несколько секунд.",
        };
    }

    return {
        tone: "red" as const,
        title: "Платёж не завершён",
        description: "ЮKassa вернула статус отмены или ошибки. Можно попробовать создать новый платёж.",
    };
}

export function TopupReturnBanner({ paymentRef }: TopupReturnBannerProps) {
    const router = useRouter();
    const hasRefreshed = useRef(false);
    const [payment, setPayment] = useState<BackendPayment | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        void (async () => {
            try {
                setError(null);
                const response = await fetch(`/api/payments/topups/${encodeURIComponent(paymentRef)}`);
                const payload = (await response.json().catch(() => ({}))) as
                    | BackendTopupPaymentStatusResponse
                    | { detail?: string };

                if (!response.ok || !("payment" in payload)) {
                    throw new Error(("detail" in payload && payload.detail) || "Не удалось проверить статус оплаты");
                }

                if (!isMounted) {
                    return;
                }

                setPayment(payload.payment);
                if (payload.payment.status.toLowerCase() === "succeeded" && !hasRefreshed.current) {
                    hasRefreshed.current = true;
                    router.refresh();
                }
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Не удалось проверить статус оплаты",
                );
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [paymentRef, router]);

    if (error) {
        return (
            <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-6 text-white">
                <div className="text-xs font-bold uppercase tracking-normal text-red-300">Ошибка платежа</div>
                <div className="mt-3 text-sm text-white/75">{error}</div>
            </div>
        );
    }

    const status = getStatusCopy(payment);
    const toneClassName = status.tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        : status.tone === "red"
            ? "border-red-500/30 bg-red-500/10 text-red-100"
            : "border-amber-500/30 bg-amber-500/10 text-amber-100";

    return (
        <div className={`rounded-[32px] border-2 p-6 ${toneClassName}`}>
            <div className="text-xs font-bold uppercase tracking-normal opacity-80">Возврат из ЮKassa</div>
            <div className="mt-3 text-2xl font-black uppercase tracking-tight">{status.title}</div>
            <div className="mt-2 text-sm opacity-85">{status.description}</div>
            <div className="mt-3 text-xs opacity-70">Локальный ID платежа: {paymentRef}</div>
        </div>
    );
}
