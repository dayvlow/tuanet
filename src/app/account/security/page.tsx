import { AccountShell } from "@/components/account/AccountShell";
import { SecurityPanel } from "@/components/account/SecurityPanel";
import { sessionsFixture } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function SecurityPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";

    return (
        <AccountShell
            title="Безопасность"
            description="2FA, сессии, уведомления"
            primaryAction={{ label: "Включить 2FA", href: "/account/security#2fa" }}
            quickActions={quickActions}
        >
            <SecurityPanel sessions={sessionsFixture} state={state} />
        </AccountShell>
    );
}
