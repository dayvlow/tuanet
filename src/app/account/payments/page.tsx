import { AccountShell } from "@/components/account/AccountShell";
import { BillingHistory } from "@/components/account/BillingHistory";
import { paymentsFixture } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";

    return (
        <AccountShell
            title="Платежи"
            description="Чеки и инвойсы"
            primaryAction={{ label: "Скачать чек", href: "/help#contact" }}
            quickActions={quickActions}
        >
            <BillingHistory payments={paymentsFixture} state={state} />
        </AccountShell>
    );
}
