"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BackendPartnerOverview } from "@/lib/backend";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PartnerFinanceProps {
    overview: BackendPartnerOverview;
}

function formatMoney(value: number): string {
    return value.toFixed(2);
}

export function PartnerFinance({ overview }: PartnerFinanceProps) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [companyInn, setCompanyInn] = useState("");
    const [directorFullName, setDirectorFullName] = useState("");
    const [bankBik, setBankBik] = useState("");
    const [settlementAccount, setSettlementAccount] = useState("");
    const [isPending, startTransition] = useTransition();

    const isPartnerActive = overview.profile.is_active;
    const available = overview.available_commission ?? 0;
    const total = overview.total_commission ?? 0;
    const pending = overview.pending_payout_total ?? 0;
    const paid = overview.paid_payout_total ?? 0;

    const payoutDetails = useMemo(() => {
        const details = [
            `Сумма: ${withdrawAmount || "—"} ₽`,
            `ИНН компании: ${companyInn || "—"}`,
            `ФИО руководителя: ${directorFullName || "—"}`,
            `БИК: ${bankBik || "—"}`,
            `Расчетный счет: ${settlementAccount || "—"}`,
        ];
        return details.join("\n");
    }, [bankBik, companyInn, directorFullName, settlementAccount, withdrawAmount]);

    function normalizeDigits(value: string, maxLength: number): string {
        return value.replace(/\D/g, "").slice(0, maxLength);
    }

    function submitPayoutRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const amount = Number(withdrawAmount);
                    if (!Number.isFinite(amount) || amount <= 0) {
                        throw new Error("Укажи сумму на вывод.");
                    }
                    if (amount > available) {
                        throw new Error(`Сумма не может превышать доступные ${formatMoney(available)} ₽.`);
                    }

                    const normalizedInn = normalizeDigits(companyInn, 12);
                    if (normalizedInn.length !== 10 && normalizedInn.length !== 12) {
                        throw new Error("ИНН должен быть 10 или 12 цифр.");
                    }
                    const normalizedBik = normalizeDigits(bankBik, 9);
                    if (normalizedBik.length !== 9) {
                        throw new Error("БИК должен быть 9 цифр.");
                    }
                    const normalizedAccount = normalizeDigits(settlementAccount, 20);
                    if (normalizedAccount.length !== 20) {
                        throw new Error("Расчётный счёт должен быть 20 цифр.");
                    }
                    if (directorFullName.trim().length < 5) {
                        throw new Error("Укажи ФИО руководителя компании.");
                    }

                    const response = await fetch("/api/partner/payout-requests", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            amount,
                            payout_details: [
                                `ИНН компании: ${normalizedInn}`,
                                `ФИО руководителя: ${directorFullName.trim()}`,
                                `БИК: ${normalizedBik}`,
                                `Расчетный счет: ${normalizedAccount}`,
                            ].join("\n"),
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось создать заявку");
                    }

                    setWithdrawAmount("");
                    setCompanyInn("");
                    setDirectorFullName("");
                    setBankBik("");
                    setSettlementAccount("");
                    setMessage("Заявка на вывод отправлена в админский кабинет.");
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось создать заявку");
                }
            })();
        });
    }

    return (
        <div className="min-w-0 w-full max-w-full overflow-x-clip grid gap-8">
            {(message || error) && (
                <div
                    className={cn(
                        "w-full max-w-full rounded-[32px] border-2 p-5 text-sm",
                        error
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                    )}
                >
                    {error ?? message}
                </div>
            )}

            <div className="min-w-0 grid w-full max-w-full gap-6 lg:grid-cols-2">
                <section className="min-w-0 w-full max-w-full overflow-hidden rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                    <div className="flex h-full min-w-0 flex-col">
                        <div className="text-sm font-bold uppercase leading-tight tracking-normal text-white/40">
                            Доступно к выводу
                        </div>
                        <div className="mt-6 flex min-w-0 max-w-full flex-wrap items-baseline gap-x-4 gap-y-2">
                            <span className="max-w-full break-words text-[clamp(3.25rem,5.8vw,4.5rem)] font-black leading-[0.95] tracking-tight tabular-nums">
                                {formatMoney(available)}
                            </span>
                            <span className="shrink-0 text-[clamp(2.75rem,5vw,3.75rem)] font-black leading-none text-white/75">
                                ₽
                            </span>
                        </div>

                        <div className="mt-auto min-w-0 pt-8">
                            <div className="min-w-0 w-full max-w-full rounded-2xl border-2 border-white/10 bg-black/20 px-5 py-4">
                                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
                                    <span className="text-xs font-bold uppercase tracking-normal text-white/45">
                                        В заявках
                                    </span>
                                    <span className="max-w-full break-words text-lg font-black text-white tabular-nums">
                                        {formatMoney(pending)} ₽
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="min-w-0 w-full max-w-full overflow-hidden rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                    <div className="flex h-full min-w-0 flex-col">
                        <div className="text-sm font-bold uppercase leading-tight tracking-normal text-white/40">
                            Всего заработано
                        </div>
                        <div className="mt-6 flex min-w-0 max-w-full flex-wrap items-baseline gap-x-4 gap-y-2">
                            <span className="max-w-full break-words text-[clamp(3.25rem,5.8vw,4.5rem)] font-black leading-[0.95] tracking-tight tabular-nums">
                                {formatMoney(total)}
                            </span>
                            <span className="shrink-0 text-[clamp(2.75rem,5vw,3.75rem)] font-black leading-none text-white/75">
                                ₽
                            </span>
                        </div>

                        <div className="mt-auto min-w-0 pt-8">
                            <div className="min-w-0 w-full max-w-full rounded-2xl border-2 border-white/10 bg-black/20 px-5 py-4">
                                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
                                    <span className="text-xs font-bold uppercase tracking-normal text-white/45">
                                        Выплачено
                                    </span>
                                    <span className="max-w-full break-words text-lg font-black text-white tabular-nums">
                                        {formatMoney(paid)} ₽
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="min-w-0 w-full max-w-full overflow-hidden rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Вывод средств</h2>
                <p className="mt-2 text-base font-medium leading-relaxed text-white/40">
                    Укажи сумму и реквизиты. Заявка попадёт в админский кабинет в раздел выплат.
                </p>

                {!isPartnerActive && (
                    <div className="mt-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                        Партнёр сейчас отключён - новые заявки на вывод временно недоступны.
                    </div>
                )}

                <form className="mt-8 min-w-0 grid w-full max-w-full gap-6" onSubmit={submitPayoutRequest}>
                    <label className="grid min-w-0 gap-3 text-sm">
                        <span className="text-xs font-bold uppercase tracking-normal text-white/40">Сумма</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(event) => setWithdrawAmount(event.target.value)}
                            placeholder={`Доступно ${formatMoney(available)} ₽`}
                            disabled={!isPartnerActive || isPending}
                            className="h-14 w-full min-w-0 max-w-full rounded-2xl border-2 border-white/15 bg-black/20 px-5 text-lg font-semibold text-white outline-none focus-visible:border-brand/50 disabled:opacity-60"
                        />
                        <div className="text-xs text-white/45">
                            В заявках сейчас: {formatMoney(pending)} ₽
                        </div>
                    </label>

                    <div className="min-w-0 grid w-full max-w-full gap-6 lg:grid-cols-2">
                        <label className="grid min-w-0 gap-3 text-sm">
                            <span className="text-xs font-bold uppercase tracking-normal text-white/40">ИНН компании</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={companyInn}
                                onChange={(event) => setCompanyInn(normalizeDigits(event.target.value, 12))}
                                placeholder="10 или 12 цифр"
                                disabled={!isPartnerActive || isPending}
                                className="h-14 w-full min-w-0 max-w-full rounded-2xl border-2 border-white/15 bg-black/20 px-5 text-lg font-semibold text-white outline-none focus-visible:border-brand/50 disabled:opacity-60"
                            />
                        </label>

                        <label className="grid min-w-0 gap-3 text-sm">
                            <span className="text-xs font-bold uppercase tracking-normal text-white/40">ФИО руководителя</span>
                            <input
                                type="text"
                                autoComplete="name"
                                value={directorFullName}
                                onChange={(event) => setDirectorFullName(event.target.value)}
                                placeholder="Иванов Иван Иванович"
                                disabled={!isPartnerActive || isPending}
                                className="h-14 w-full min-w-0 max-w-full rounded-2xl border-2 border-white/15 bg-black/20 px-5 text-lg font-semibold text-white outline-none focus-visible:border-brand/50 disabled:opacity-60"
                            />
                        </label>

                        <label className="grid min-w-0 gap-3 text-sm">
                            <span className="text-xs font-bold uppercase tracking-normal text-white/40">БИК</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={bankBik}
                                onChange={(event) => setBankBik(normalizeDigits(event.target.value, 9))}
                                placeholder="9 цифр"
                                disabled={!isPartnerActive || isPending}
                                className="h-14 w-full min-w-0 max-w-full rounded-2xl border-2 border-white/15 bg-black/20 px-5 text-lg font-semibold text-white outline-none focus-visible:border-brand/50 disabled:opacity-60"
                            />
                        </label>

                        <label className="grid min-w-0 gap-3 text-sm">
                            <span className="text-xs font-bold uppercase tracking-normal text-white/40">Расчётный счёт</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={settlementAccount}
                                onChange={(event) => setSettlementAccount(normalizeDigits(event.target.value, 20))}
                                placeholder="20 цифр"
                                disabled={!isPartnerActive || isPending}
                                className="h-14 w-full min-w-0 max-w-full rounded-2xl border-2 border-white/15 bg-black/20 px-5 text-lg font-semibold text-white outline-none focus-visible:border-brand/50 disabled:opacity-60"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!isPartnerActive || isPending}
                        className={cn(
                            buttonVariants({ variant: "brand", size: "lg" }),
                            "h-16 w-full min-w-0 max-w-full rounded-3xl uppercase tracking-widest text-sm font-bold disabled:opacity-60",
                        )}
                    >
                        {isPending ? "Отправляем..." : "Отправить заявку"}
                    </button>
                </form>

                <div className="mt-8 min-w-0 w-full max-w-full rounded-3xl border-2 border-white/10 bg-black/20 p-5 text-base font-medium text-white/60">
                    Данные, которые отправятся в заявке:
                    <pre className="mt-3 min-w-0 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border-2 border-white/10 bg-black/20 p-4 text-xs text-white/60">
                        {payoutDetails}
                    </pre>
                </div>
            </section>

            <section className="min-w-0 w-full max-w-full overflow-hidden rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Заявки на вывод</h2>
                <div className="mt-6 min-w-0 max-w-full overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-normal text-white/40">
                            <tr>
                                <th className="pb-3 pr-4">ID</th>
                                <th className="pb-3 pr-4">Сумма</th>
                                <th className="pb-3 pr-4">Статус</th>
                                <th className="pb-3 pr-4">Создана</th>
                                <th className="pb-3 pr-4">Комментарий</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.payout_requests.length > 0 ? overview.payout_requests.map((request) => (
                                <tr key={request.id} className="border-t border-white/10 align-top">
                                    <td className="py-3 pr-4 font-semibold">#{request.id}</td>
                                    <td className="py-3 pr-4">{formatMoney(request.amount)} ₽</td>
                                    <td className="py-3 pr-4 uppercase">{request.status}</td>
                                    <td className="py-3 pr-4">{request.requested_at ? new Date(request.requested_at).toLocaleDateString("ru-RU") : "—"}</td>
                                    <td className="py-3 pr-4 text-white/60">{request.admin_comment || "—"}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-white/50">
                                        Заявок на вывод пока нет.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
