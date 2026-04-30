import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { SecurityPanel } from "@/components/account/SecurityPanel";
import {
    BackendAccount,
    BackendDeviceList,
    getAccountHomePath,
    getAccountDisplayLabel,
    getTelegramIdentity,
} from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

export default async function SecurityPage() {
    let state: "success" | "loading" | "empty" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let devicesPayload: BackendDeviceList | null = null;

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
            devicesPayload = await fetchBackendJson<BackendDeviceList>("/devices/me", { token: token ?? undefined });
            if (!devicesPayload.devices.length) {
                state = "empty";
            }
        } catch {
            state = "error";
        }
    }

    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const emailIdentity = account?.identities.find((identity) => identity.provider === "email") ?? null;
    const telegramIdentity = account ? getTelegramIdentity(account) : null;

    return (
        <AccountShell
            title="Безопасность"
            description="2FA, устройства и контроль доступа"
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal}
        >
            <SecurityPanel
                state={state}
                emailIdentity={emailIdentity}
                telegramExternalId={telegramIdentity?.external_id}
                telegramUsername={telegramIdentity?.external_username}
                portal={account?.portal}
            />
        </AccountShell>
    );
}
