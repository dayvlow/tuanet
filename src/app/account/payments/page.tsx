import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { BalanceTopupAction } from "@/components/account/BalanceTopupAction";
import { BillingHistory } from "@/components/account/BillingHistory";
import { TopupReturnBanner } from "@/components/account/TopupReturnBanner";
import {
    BackendAccount,
    BackendDashboard,
    BackendPayments,
    getAccountHomePath,
    getAccountDisplayLabel,
    mapBackendPayment,
} from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

interface PaymentsPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
    let state: "success" | "loading" | "empty" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let paymentsPayload: BackendPayments | null = null;
    let dashboard: BackendDashboard | null = null;

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
            [paymentsPayload, dashboard] = await Promise.all([
                fetchBackendJson<BackendPayments>("/payments/me?limit=20", { token: token ?? undefined }),
                fetchBackendJson<BackendDashboard>("/dashboard/me", { token: token ?? undefined }),
            ]);
            if (!paymentsPayload.payments.length) {
                state = "empty";
            }
        } catch {
            state = "error";
        }
    }

    const payments = paymentsPayload?.payments.map(mapBackendPayment) ?? [];
    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const paymentRefParam = resolvedSearchParams?.payment;
    const paymentRef = Array.isArray(paymentRefParam) ? paymentRefParam[0] : paymentRefParam;

    return (
        <AccountShell
            title="Платежи"
            description="История пополнений и текущих статусов оплат"
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal}
        >
            <div className="grid gap-8">
                {paymentRef && <TopupReturnBanner paymentRef={paymentRef} />}
                {state !== "error" && dashboard && (
                    <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-normal text-white/40">Баланс</div>
                                <div className="mt-4 text-4xl font-black uppercase tracking-tight">
                                    {dashboard.balance.toFixed(2)} ₽
                                </div>
                                <div className="mt-2 text-sm text-white/60">
                                    Всего пополнений: {dashboard.payments_total.toFixed(2)} ₽
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <BalanceTopupAction
                                    defaultPromoCode={dashboard.active_promo?.code ?? null}
                                    triggerLabel="Пополнить баланс"
                                    triggerClassName="h-11 px-5"
                                />
                            </div>
                        </div>
                    </section>
                )}
                <BillingHistory payments={payments} state={state} />
            </div>
        </AccountShell>
    );
}
