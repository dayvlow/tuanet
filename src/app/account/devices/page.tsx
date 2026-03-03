import { AccountShell } from "@/components/account/AccountShell";
import { DevicesPanel } from "@/components/account/DevicesPanel";
import { devicesFixture, deviceLimit } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function DevicesPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";

    return (
        <AccountShell
            title="Устройства"
            description="Лимиты и активные подключения"
            primaryAction={{ label: "Подключить", href: "/download" }}
            quickActions={quickActions}
        >
            <DevicesPanel devices={devicesFixture} deviceLimit={deviceLimit} state={state} />
        </AccountShell>
    );
}
