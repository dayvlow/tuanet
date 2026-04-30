import { BackendAccount, BackendDashboard, BackendMyPromos } from "@/lib/backend";

interface SubscriptionSnapshotProps {
    account: BackendAccount;
    dashboard: BackendDashboard;
    promos: BackendMyPromos;
}

export function SubscriptionSnapshot({ account, dashboard, promos }: SubscriptionSnapshotProps) {
    const accessStatus =
        dashboard.devices_active > 0
            ? "Активен"
            : dashboard.balance > 0 || dashboard.payments_total > 0
                ? "Готов к подключению"
                : "Ещё не активирован";

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Оплата и доступ</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">
                        Баланс, доступ и состояние подписки по текущему аккаунту.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border-2 border-white/10 p-4">
                        <div className="text-sm font-medium tracking-normal text-white/50">Статус доступа</div>
                        <div className="mt-2 text-lg font-bold">{accessStatus}</div>
                    </div>

                    <div className="rounded-3xl border-2 border-white/10 p-4">
                        <div className="text-sm font-medium tracking-normal text-white/50">Баланс</div>
                        <div className="mt-2 text-lg font-bold">{dashboard.balance.toFixed(2)} ₽</div>
                    </div>

                    <div className="rounded-3xl border-2 border-white/10 p-4">
                        <div className="text-sm font-medium tracking-normal text-white/50">Устройства</div>
                        <div className="mt-2 text-lg font-bold">
                            {dashboard.devices_active} активных
                        </div>
                        <div className="mt-2 text-sm text-white/60">Всего подключено: {dashboard.devices_total}</div>
                    </div>

                    <div className="rounded-3xl border-2 border-white/10 p-4">
                        <div className="text-sm font-medium tracking-normal text-white/50">Бонусы</div>
                        <div className="mt-2 text-lg font-bold">{dashboard.bonus_available.toFixed(2)} ₽</div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-5">
                        <div className="text-sm font-medium tracking-normal text-white/50">Привязанные входы</div>
                        <div className="mt-2 text-lg font-bold">
                            {dashboard.linked_providers.length > 0
                                ? dashboard.linked_providers.join(", ")
                                : "Пока нет"}
                        </div>
                        <div className="mt-2 text-sm text-white/60">ID аккаунта: #{account.account_id}</div>
                    </div>

                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-5">
                        <div className="text-sm font-medium tracking-normal text-white/50">Промо-статус</div>
                        <div className="mt-2 text-lg font-bold">
                            {promos.active_promo?.code ?? "Активного промокода нет"}
                        </div>
                        <div className="mt-2 text-sm text-white/60">
                            Использовано кодов: {promos.used_promocodes.length}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
