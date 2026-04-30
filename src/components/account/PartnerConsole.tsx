"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BackendPartnerLink, BackendPartnerOverview } from "@/lib/backend";
import { buildPortalUrl } from "@/lib/portal-host";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PartnerConsoleProps {
    overview: BackendPartnerOverview;
    telegramBotUsername: string;
}

function formatMoney(value: number): string {
    return `${value.toFixed(2)} ₽`;
}

function formatDate(value: string | null): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function getReferralIdentityLabel(referral: BackendPartnerOverview["referrals"][number]): string {
    if (referral.telegram_username) {
        return `@${referral.telegram_username}`;
    }
    if (referral.telegram_id) {
        return `TG ${referral.telegram_id}`;
    }
    if (referral.email) {
        return referral.email;
    }
    if (referral.display_name) {
        return referral.display_name;
    }
    return "Без привязки";
}

export function PartnerConsole({ overview, telegramBotUsername }: PartnerConsoleProps) {
    const router = useRouter();
    const isPartnerActive = overview.profile.is_active;
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [linkLabel, setLinkLabel] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [payoutDetails, setPayoutDetails] = useState(overview.profile.default_payout_details ?? "");
    const [isPending, startTransition] = useTransition();

    async function copy(value: string, label: string) {
        try {
            await navigator.clipboard.writeText(value);
            setError(null);
            setMessage(`${label} скопирована.`);
        } catch {
            setMessage(null);
            setError(`Не удалось скопировать ${label.toLowerCase()}.`);
        }
    }

    function createLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch("/api/partner/links", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ label: linkLabel || undefined }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось создать ссылку");
                    }

                    setLinkLabel("");
                    setMessage("Новая партнёрская ссылка создана.");
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось создать ссылку");
                }
            })();
        });
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

                    const response = await fetch("/api/partner/payout-requests", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            amount,
                            payout_details: payoutDetails,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось создать заявку");
                    }

                    setWithdrawAmount("");
                    setMessage("Заявка на вывод отправлена в админский кабинет.");
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось создать заявку");
                }
            })();
        });
    }

    return (
        <div className="min-w-0 grid gap-8">
            {(message || error) && (
                <div className={cn(
                    "rounded-[32px] border-2 p-5 text-sm",
                    error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                )}>
                    {error ?? message}
                </div>
            )}

            {!isPartnerActive && (
                <div className="rounded-[32px] border-2 border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                    Партнёр сейчас отключён. Новые привязки по ссылкам и новые комиссионные начисления остановлены, но история и уже заработанный баланс остаются доступными.
                </div>
            )}

            <div className="min-w-0 grid gap-6 lg:grid-cols-4">
                <PartnerMetric title="1 уровень" value={`${overview.profile.level1_percent}%`} note={`${overview.direct_count} клиентов`} />
                <PartnerMetric title="2 уровень" value={`${overview.profile.level2_percent}%`} note={`${overview.level2_count} клиентов`} />
                <PartnerMetric title="Доступно к выводу" value={formatMoney(overview.available_commission)} note={`В заявках: ${formatMoney(overview.pending_payout_total)}`} />
                <PartnerMetric title="Всего заработано" value={formatMoney(overview.total_commission)} note={`Выплачено: ${formatMoney(overview.paid_payout_total)}`} />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Партнёрские ссылки</h2>
                            <p className="mt-2 text-sm text-white/55">
                                Создавай отдельные ссылки под каналы трафика и распространяй их в сайт или Telegram.
                            </p>
                        </div>
                        <form className="flex w-full flex-wrap items-center gap-3 xl:w-auto" onSubmit={createLink}>
                            <input
                                type="text"
                                value={linkLabel}
                                onChange={(event) => setLinkLabel(event.target.value)}
                                placeholder="Название ссылки"
                                disabled={!isPartnerActive || isPending}
                                className="h-11 min-w-0 flex-1 rounded-2xl border-2 border-white/15 bg-black/20 px-4 text-sm font-semibold text-white xl:min-w-[220px] xl:flex-none"
                            />
                            <button
                                type="submit"
                                disabled={!isPartnerActive || isPending}
                                className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-11 w-full uppercase tracking-normal disabled:opacity-60 sm:w-auto")}
                            >
                                {isPartnerActive ? "Создать ссылку" : "Партнёр отключён"}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 grid gap-4">
                        {overview.links.map((link) => (
                            <PartnerLinkCard
                                key={link.id}
                                link={link}
                                telegramBotUsername={telegramBotUsername}
                                onCopy={copy}
                            />
                        ))}
                    </div>
                </section>

                <section className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Вывод средств</h2>
                    <p className="mt-2 text-sm text-white/55">
                        Укажи сумму и реквизиты. Заявка попадёт в админский кабинет в раздел выплат.
                    </p>

                    <form className="mt-6 grid gap-4" onSubmit={submitPayoutRequest}>
                        <label className="grid gap-2 text-sm">
                            <span className="font-bold uppercase tracking-normal text-white/45">Сумма</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={withdrawAmount}
                                onChange={(event) => setWithdrawAmount(event.target.value)}
                                placeholder={`Доступно ${formatMoney(overview.available_commission)}`}
                                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                            />
                        </label>
                        <label className="grid gap-2 text-sm">
                            <span className="font-bold uppercase tracking-normal text-white/45">Реквизиты</span>
                            <textarea
                                value={payoutDetails}
                                onChange={(event) => setPayoutDetails(event.target.value)}
                                placeholder="Карта / СБП / банк / получатель"
                                rows={5}
                                className="rounded-2xl border-2 border-white/15 bg-black/20 px-4 py-3 font-medium text-white"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                        >
                            Отправить заявку
                        </button>
                    </form>

                    <div className="mt-6 rounded-2xl border-2 border-white/10 bg-black/20 p-4 text-sm text-white/60">
                        Выплачено: <span className="font-bold text-white">{formatMoney(overview.paid_payout_total)}</span>
                    </div>
                </section>
            </div>

            <section className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Рефералы партнёра</h2>
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-normal text-white/40">
                            <tr>
                                <th className="pb-3 pr-4">Аккаунт</th>
                                <th className="pb-3 pr-4">Уровень</th>
                                <th className="pb-3 pr-4">Заработано</th>
                                <th className="pb-3 pr-4">Приглашён</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.referrals.length > 0 ? overview.referrals.map((referral) => (
                                <tr key={`${referral.level}-${referral.account_id}`} className="border-t border-white/10">
                                    <td className="py-3 pr-4">
                                        <div className="font-semibold">{referral.public_id ?? `#${referral.account_id}`}</div>
                                        <div className="text-xs text-white/45">#{referral.account_id}</div>
                                        <div className="text-xs text-white/45">{getReferralIdentityLabel(referral)}</div>
                                    </td>
                                    <td className="py-3 pr-4">{referral.level} уровень</td>
                                    <td className="py-3 pr-4">{formatMoney(referral.earned_amount)}</td>
                                    <td className="py-3 pr-4">{formatDate(referral.invited_at)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-white/50">
                                        Пока нет приглашённых пользователей.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Заявки на вывод</h2>
                <div className="mt-6 overflow-x-auto">
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
                                    <td className="py-3 pr-4">{formatMoney(request.amount)}</td>
                                    <td className="py-3 pr-4 uppercase">{request.status}</td>
                                    <td className="py-3 pr-4">{formatDate(request.requested_at)}</td>
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

function PartnerMetric({ title, value, note }: { title: string; value: string; note: string }) {
    return (
        <div className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-6 text-white sm:p-8">
            <div className="text-xs font-bold uppercase tracking-normal text-white/40">{title}</div>
            <div className="mt-4 break-words text-4xl font-black uppercase tracking-tight">{value}</div>
            <div className="mt-2 break-words text-sm text-white/55">{note}</div>
        </div>
    );
}

function PartnerLinkCard({
    link,
    telegramBotUsername,
    onCopy,
}: {
    link: BackendPartnerLink;
    telegramBotUsername: string;
    onCopy: (value: string, label: string) => Promise<void>;
}) {
    const siteLink =
        typeof window === "undefined"
            ? buildPortalUrl("main", link.site_referral_path)
            : buildPortalUrl("main", link.site_referral_path, "", window.location.protocol);
    const telegramLink = `https://t.me/${telegramBotUsername}?start=${link.telegram_referral_start}`;

    return (
        <div className="min-w-0 rounded-2xl border-2 border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">{link.label || "Партнёрская ссылка"}</div>
                    <div className="mt-1 break-words text-xs text-white/45">Код: {link.code} • Создана {formatDate(link.created_at)}</div>
                </div>
                <div className="rounded-full border-2 border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-white/65">
                    {link.is_active ? "Активна" : "Отключена"}
                </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <LinkValue
                    title="Сайт"
                    value={siteLink}
                    onCopy={() => void onCopy(siteLink, "Ссылка сайта")}
                />
                <LinkValue
                    title="Telegram"
                    value={telegramLink}
                    onCopy={() => void onCopy(telegramLink, "Telegram-ссылка")}
                />
            </div>
        </div>
    );
}

function LinkValue({
    title,
    value,
    onCopy,
}: {
    title: string;
    value: string;
    onCopy: () => void;
}) {
    return (
        <div className="min-w-0 rounded-2xl border-2 border-white/10 bg-white/5 p-4">
            <div className="text-xs font-bold uppercase tracking-normal text-white/45">{title}</div>
            <div className="mt-3 break-all rounded-2xl border-2 border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/90">
                {value}
            </div>
            <button
                type="button"
                onClick={onCopy}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 h-10 border-2 px-4 text-xs uppercase tracking-normal")}
            >
                Копировать
            </button>
        </div>
    );
}
