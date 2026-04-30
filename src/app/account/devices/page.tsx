import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { DevicesPanel } from "@/components/account/DevicesPanel";
import {
    BackendAccount,
    BackendDevice,
    BackendDeviceCatalog,
    BackendDashboard,
    BackendDeviceList,
    getAccountHomePath,
    getAccountDisplayLabel,
    mapBackendDevice,
} from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

interface DevicesPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DevicesPage({ searchParams }: DevicesPageProps) {
    let state: "success" | "loading" | "empty" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let devicesPayload: BackendDeviceList | null = null;
    let dashboard: BackendDashboard | null = null;
    let deviceCatalog: BackendDeviceCatalog | null = null;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const demoErrorParam = resolvedSearchParams?.demoError;
    const demoErrorMode = Array.isArray(demoErrorParam) ? demoErrorParam[0] : demoErrorParam;
    const initialCreateError = demoErrorMode === "1"
        ? "Упс, что-то сломалось. Уже чиним. Код ошибки: DEMO-ERROR."
        : demoErrorMode === "plain"
            ? "Упс, что-то сломалось. Уже чиним."
            : null;

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
            [devicesPayload, dashboard, deviceCatalog] = await Promise.all([
                fetchBackendJson<BackendDeviceList>("/devices/me", { token: token ?? undefined }),
                fetchBackendJson<BackendDashboard>("/dashboard/me", { token: token ?? undefined }),
                fetchBackendJson<BackendDeviceCatalog>("/devices/options?include_status=0", { token: token ?? undefined }),
            ]);
            if (!devicesPayload.devices.length) {
                state = "empty";
            }
        } catch {
            state = "error";
        }
    }

    const devices = devicesPayload?.devices.map(mapBackendDevice) ?? [];
    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const devicePrice = deviceCatalog?.device_price ?? 0;
    const platforms = deviceCatalog?.platforms ?? [];
    const countries = deviceCatalog?.countries ?? [];
    const balance = dashboard?.balance ?? account?.balance ?? 0;
    const rawDevices: BackendDevice[] = devicesPayload?.devices ?? [];

    return (
        <AccountShell
            title="Устройства"
            description="Активные подключения и управление устройствами"
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal}
        >
            <DevicesPanel
                devices={devices}
                state={state}
                balance={balance}
                devicePrice={devicePrice}
                platforms={platforms}
                countries={countries}
                rawDevices={rawDevices}
                initialCreateError={initialCreateError}
                initialCreateOpen={Boolean(initialCreateError)}
            />
        </AccountShell>
    );
}
