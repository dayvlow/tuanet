import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { BalanceTopupAction } from "@/components/account/BalanceTopupAction";
import { ReferralOverviewCard } from "@/components/account/ReferralOverviewCard";
import { TelegramLinkCard } from "@/components/account/TelegramLinkCard";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
    BackendAccount,
    BackendDashboard,
    BackendReferrals,
    getAccountHomePath,
    getAccountDisplayLabel,
    getTelegramIdentity,
} from "@/lib/backend";
import { fetchBackendJson, reportSystemError } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

export default async function AccountDashboardPage() {
    let state: "success" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let dashboard: BackendDashboard | null = null;
    let referrals: BackendReferrals | null = null;

    try {
        const session = await requireSessionAccount("customer");
        token = session.token;
        account = session.account;
    } catch (error) {
        rethrowNavigationSignal(error);
        state = "error";
    }

    if (account) {
        const homePath = getAccountHomePath(account);
        if (homePath !== "/account") {
            redirect(homePath);
        }
    }

    if (state === "success" && account) {
        try {
            [dashboard, referrals] = await Promise.all([
                fetchBackendJson<BackendDashboard>("/dashboard/me", { token: token ?? undefined }),
                fetchBackendJson<BackendReferrals>("/referrals/me", { token: token ?? undefined }),
            ]);
        } catch (error) {
            await reportSystemError({
                title: "Ошибка загрузки обзора аккаунта",
                message: "Не удалось загрузить данные главной страницы кабинета.",
                source: "website_server",
                details: error instanceof Error ? error.message : "account_dashboard_load_failed",
                portal: "customer",
                path: "/account",
                relatedAccountId: account.account_id,
            });
            state = "error";
        }
    }

    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const telegramIdentity = account ? getTelegramIdentity(account) : undefined;

    return (
        <AccountShell
            title="Обзор"
            description="Главная страница твоего кабинета"
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal}
        >
            <div className="grid gap-8">
                {state === "error" && (
                    <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-red-300">Ошибка</div>
                        <div className="mt-4 text-3xl font-black uppercase tracking-tight">
                            Упс, что-то сломалось
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                            Уже чиним. Попробуй обновить страницу чуть позже.
                        </div>
                    </div>
                )}

                {state === "success" && account && dashboard && referrals && (
                    <>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                                <div className="text-xs font-bold uppercase tracking-normal text-white/40">Баланс</div>
                                <div className="mt-4 text-4xl font-black uppercase tracking-tight">
                                    {dashboard.balance.toFixed(2)} ₽
                                </div>
                                <div className="text-sm text-white/60">
                                    Пополнений всего: {dashboard.payments_total.toFixed(2)} ₽
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <BalanceTopupAction
                                        defaultPromoCode={dashboard.active_promo?.code ?? null}
                                        triggerClassName="h-10 px-4"
                                    />
                                    <Link
                                        href="/account/payments"
                                        className={cn(
                                            buttonVariants({ variant: "outline", size: "sm" }),
                                            "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                        )}
                                    >
                                        История платежей
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                                <div className="text-xs font-bold uppercase tracking-normal text-white/40">Устройства</div>
                                <div className="mt-4 text-4xl font-black uppercase tracking-tight">
                                    {dashboard.devices_active} активных
                                </div>
                                <div className="text-sm text-white/60">
                                    Всего устройств в аккаунте: {dashboard.devices_total}
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="/account/devices"
                                        className={cn(
                                            buttonVariants({ variant: "outline", size: "sm" }),
                                            "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                        )}
                                    >
                                        Открыть устройства
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <ReferralOverviewCard
                                referralCode={referrals.referral_code}
                                directCount={referrals.direct_count}
                                level2Count={referrals.level2_count}
                                bonusAvailable={referrals.bonus_available}
                            />

                            <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                                <div className="text-xs font-bold uppercase tracking-normal text-white/40">Способы входа</div>
                                <div className="mt-4 text-3xl font-black uppercase tracking-tight">
                                    {dashboard.linked_providers.length}
                                </div>
                                <div className="text-sm text-white/60">
                                    {dashboard.linked_providers.length > 0
                                        ? dashboard.linked_providers.join(", ")
                                        : "Пока нет привязанных провайдеров"}
                                </div>
                                {dashboard.active_promo && (
                                    <div className="mt-4 rounded-2xl border-2 border-brand/30 bg-brand/10 p-4 text-sm text-white/80">
                                        Активный промокод: <span className="font-bold">{dashboard.active_promo.code}</span> (+{dashboard.active_promo.bonus}%)
                                    </div>
                                )}
                            </div>
                        </div>

                        <TelegramLinkCard
                            telegramExternalId={telegramIdentity?.external_id}
                            telegramUsername={telegramIdentity?.external_username}
                            portal={account.portal}
                        />
                    </>
                )}
            </div>
        </AccountShell>
    );
}
