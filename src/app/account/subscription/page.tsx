import { AccountShell } from "@/components/account/AccountShell";
import { SubscriptionPanel } from "@/components/account/SubscriptionPanel";
import { subscriptionFixture, paymentsFixture } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function SubscriptionPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    const primaryAction =
        state === "empty"
            ? { label: "Выбрать тариф", href: "/pricing" }
            : { label: "Продлить", href: "/checkout" };

    return (
        <AccountShell
            title="Подписка"
            description="Тариф, автопродление, отмена"
            primaryAction={primaryAction}
            quickActions={quickActions}
        >
            <SubscriptionPanel subscription={subscriptionFixture} payments={paymentsFixture} state={state} />
        </AccountShell>
    );
}
