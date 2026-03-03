"use client";

import { SubscriptionInfo } from "@/lib/account-fixtures";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";

interface SubscriptionCardProps {
    subscription?: SubscriptionInfo | null;
    state?: ModuleState;
    onCancel?: () => void;
}

export function SubscriptionCard({ subscription, state = "success", onCancel }: SubscriptionCardProps) {
    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Подписка</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Управление тарифом и оплатой</p>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка подписки…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-600">Ошибка подписки</div>
                        <p className="mt-2 text-lg">Не удалось загрузить данные. Попробуй позже.</p>
                    </div>
                )}

                {state === "empty" && (
                    <div className="rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Подписки нет</h3>
                        <p className="mt-3 text-base font-medium leading-relaxed text-white/40">
                            Выбери тариф и подключись за минуту
                        </p>
                        <button
                            type="button"
                            className="mt-6 h-10 rounded-full border-2 border-white/20 px-5 text-xs font-bold uppercase tracking-normal  text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Выбрать тариф
                        </button>
                    </div>
                )}

                {state === "success" && subscription && (
                    <div className="space-y-5">
                        <div className="rounded-3xl border-2 border-white/10 bg-white/5 p-5">
                            <div className="text-sm font-medium tracking-normal  text-white/50">Текущий тариф</div>
                            <div className="mt-2 text-3xl font-black uppercase tracking-tight">{subscription.plan}</div>
                            <div className="mt-1 text-sm text-white/60">Лимит устройств: {subscription.deviceLimit}</div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border-2 border-white/10 p-4">
                                <div className="text-sm font-medium tracking-normal  text-white/50">Статус</div>
                                <div className="mt-2 text-lg font-bold">
                                    {subscription.status === "active"
                                        ? "Активна"
                                        : subscription.status === "expiring"
                                            ? "Заканчивается"
                                            : "Отменена"}
                                </div>
                            </div>
                            <div className="rounded-3xl border-2 border-white/10 p-4">
                                <div className="text-sm font-medium tracking-normal  text-white/50">Продление</div>
                                <div className="mt-2 text-lg font-bold">{subscription.renewAt}</div>
                            </div>
                            <div className="rounded-3xl border-2 border-white/10 p-4">
                                <div className="text-sm font-medium tracking-normal  text-white/50">Окончание</div>
                                <div className="mt-2 text-lg font-bold">{subscription.endsAt}</div>
                            </div>
                            <div className="rounded-3xl border-2 border-white/10 p-4">
                                <div className="text-sm font-medium tracking-normal  text-white/50">Автопродление</div>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className={cn(
                                        "h-8 w-14 rounded-full border-2 border-white/20",
                                        subscription.autoRenew ? "bg-brand" : "bg-black/10"
                                    )}>
                                        <div
                                            className={cn(
                                                "h-6 w-6 rounded-full bg-white shadow",
                                                subscription.autoRenew ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-normal">
                                        {subscription.autoRenew ? "Включено" : "Выключено"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal  text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Продлить
                            </button>
                            <button
                                type="button"
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal  text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Сменить тариф
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="h-10 rounded-full border-2 border-red-300/30 px-4 text-xs font-bold uppercase tracking-normal text-red-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Отменить
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
