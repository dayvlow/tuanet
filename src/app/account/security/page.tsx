import { AccountShell } from "@/components/account/AccountShell";
import { SecurityPanel } from "@/components/account/SecurityPanel";
import { getAccountData } from "@/lib/supabase/account";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Безопасность", href: "/account/security" },
    { label: "Профиль", href: "/account/profile" },
];

export default async function SecurityPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const data = await getAccountData();
    const forcedState = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    const state = forcedState === "success" && data.errors.sessions ? "error" : forcedState;

    return (
        <AccountShell
            title="Безопасность"
            description="Защита входа и активные сессии"
            primaryAction={{ label: "Включить 2FA", href: "/account/security#2fa" }}
            quickActions={quickActions}
        >
            <SecurityPanel
                sessions={data.sessions}
                state={state}
                initialTwoFactorEnabled={Boolean(data.profile.twoFactorEnabled)}
            />
        </AccountShell>
    );
}
