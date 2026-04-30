import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { PromoActivationCard } from "@/components/account/PromoActivationCard";
import { SubscriptionSnapshot } from "@/components/account/SubscriptionSnapshot";
import { TopupReturnBanner } from "@/components/account/TopupReturnBanner";
import {
    BackendAccount,
    BackendDashboard,
    BackendMyPromos,
    BackendPromoCatalog,
    getAccountHomePath,
    getAccountDisplayLabel,
} from "@/lib/backend";
import { fetchBackendJson, reportSystemError } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

interface SubscriptionPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
    let state: "success" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let dashboard: BackendDashboard | null = null;
    let myPromos: BackendMyPromos | null = null;
    let promoCatalog: BackendPromoCatalog | null = null;

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
            [dashboard, myPromos, promoCatalog] = await Promise.all([
                fetchBackendJson<BackendDashboard>("/dashboard/me", { token: token ?? undefined }),
                fetchBackendJson<BackendMyPromos>("/promos/me", { token: token ?? undefined }),
                fetchBackendJson<BackendPromoCatalog>("/promocodes/active", { token: token ?? undefined }),
            ]);
        } catch (error) {
            await reportSystemError({
                title: "Ошибка загрузки подписки",
                message: "Не удалось загрузить данные раздела подписки.",
                source: "website_server",
                details: error instanceof Error ? error.message : "subscription_page_load_failed",
                portal: "customer",
                path: "/account/subscription",
                relatedAccountId: account.account_id,
            });
            state = "error";
        }
    }

    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const paymentRefParam = resolvedSearchParams?.payment;
    const paymentRef = Array.isArray(paymentRefParam) ? paymentRefParam[0] : paymentRefParam;
    const usedPromoCodes = new Set(myPromos?.used_promocodes.map((item) => item.code) ?? []);
    const availablePromos = promoCatalog?.promocodes.filter((promo) => {
        if (usedPromoCodes.has(promo.code)) {
            return false;
        }
        if (myPromos?.active_promo?.code && promo.code === myPromos.active_promo.code) {
            return false;
        }
        return true;
    }) ?? [];

    return (
        <AccountShell
            title="Подписка"
            description="Баланс, доступ и промокоды"
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

                {state === "success" && account && dashboard && myPromos && promoCatalog && (
                    <>
                        {paymentRef && <TopupReturnBanner paymentRef={paymentRef} />}
                        <SubscriptionSnapshot account={account} dashboard={dashboard} promos={myPromos} />
                        <PromoActivationCard
                            activePromo={myPromos.active_promo}
                            availablePromos={availablePromos}
                        />
                    </>
                )}
            </div>
        </AccountShell>
    );
}
