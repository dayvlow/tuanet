"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandedQrCard } from "@/components/account/BrandedQrCard";
import { DevicesTable } from "@/components/account/DevicesTable";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { DeviceItem } from "@/lib/account-fixtures";
import { ModuleState } from "@/components/account/KeysTable";
import { reportClientIssue } from "@/lib/client-monitoring";
import {
    BackendDevice,
    BackendDeviceCatalog,
    BackendDeviceCountryOption,
    BackendDevicePlatformOption,
    getAppDownloadHref,
    getConfigInstallHref,
    getCountryLabel,
    getInstructionHref,
    getQrCodeUrl,
    mapBackendDevice,
} from "@/lib/backend";

interface DevicesPanelProps {
    devices: DeviceItem[];
    rawDevices: BackendDevice[];
    state: ModuleState;
    balance: number;
    devicePrice: number;
    platforms: BackendDevicePlatformOption[];
    countries: BackendDeviceCountryOption[];
    initialError?: string | null;
    initialCreateError?: string | null;
    initialCreateOpen?: boolean;
}

interface DeviceCreateResponse {
    success: boolean;
    account_id: number;
    balance: number;
    device_price: number;
    country_label: string;
    app_link: string | null;
    install_url: string | null;
    device: BackendDevice;
}

interface DeviceDeleteResponse {
    success: boolean;
    account_id: number;
    balance: number;
    deleted_username: string;
    remaining_devices: number;
}

type DeviceOperationKind = "create" | "delete" | "delete_all";

interface DeviceOperationState {
    kind: DeviceOperationKind;
    mode: "progress" | "success";
    progress: number;
    title: string;
    description: string;
}

function getServerLoadTone(level: BackendDeviceCountryOption["load_level"]): string {
    switch (level) {
        case "high":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "medium":
            return "border-amber-500/30 bg-amber-500/10 text-amber-100";
        case "low":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
        default:
            return "border-white/15 bg-white/5 text-white/60";
    }
}

function getServerLoadBadgeLabel(country: BackendDeviceCountryOption): string {
    switch (country.load_level) {
        case "high":
            return "Сильная";
        case "medium":
            return "Средняя";
        case "low":
            return "Слабая";
        default:
            return country.load_label?.trim() || "Проверяем";
    }
}

function getCompactServerLoadTone(level: BackendDeviceCountryOption["load_level"]): string {
    switch (level) {
        case "high":
            return "border-red-500/45 bg-red-500/18 text-red-800";
        case "medium":
            return "border-amber-500/50 bg-amber-400/22 text-amber-900";
        case "low":
            return "border-emerald-500/45 bg-emerald-500/18 text-emerald-800";
        default:
            return "border-black/15 bg-black/6 text-black/70";
    }
}

function ServerLoadBadge({
    country,
    compact = false,
}: {
    country: BackendDeviceCountryOption;
    compact?: boolean;
}) {
    return (
        <span className={cn(
            "inline-flex items-center justify-center rounded-full border font-black uppercase",
            compact ? "min-h-8 min-w-[9.5rem] px-4 py-1.5 text-xs tracking-[0.02em]" : "px-3 py-1 text-[11px] tracking-normal",
            compact ? getCompactServerLoadTone(country.load_level) : getServerLoadTone(country.load_level),
        )}>
            {getServerLoadBadgeLabel(country)}
        </span>
    );
}

function ServerStatusCard({
    country,
    compact = false,
}: {
    country: BackendDeviceCountryOption;
    compact?: boolean;
}) {
    return (
        <div className={cn(
            "rounded-3xl border-2 p-5",
            compact ? "border-black/10 bg-black/5" : "border-white/10 bg-black/20 text-white",
        )}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className={cn("text-xs font-bold uppercase tracking-normal", compact ? "text-black/45" : "text-white/45")}>
                        Сервер
                    </div>
                    <div className={cn("mt-2 text-lg font-black", compact ? "text-black" : "text-white")}>
                        {country.flag} {country.label}
                    </div>
                    <div className={cn("mt-2 text-sm font-medium", compact ? "text-black/60" : "text-white/60")}>
                        {country.load_label}
                    </div>
                </div>
                <ServerLoadBadge country={country} compact={compact} />
            </div>
        </div>
    );
}

export function DevicesPanel({
    devices,
    rawDevices,
    state,
    balance,
    devicePrice,
    platforms,
    countries,
    initialError = null,
    initialCreateError = null,
    initialCreateOpen = false,
}: DevicesPanelProps) {
    const router = useRouter();
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(initialCreateOpen);
    const [deleteTarget, setDeleteTarget] = useState<DeviceItem | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [platform, setPlatform] = useState(platforms[0]?.id ?? "ios");
    const [country, setCountry] = useState(countries[0]?.id ?? "nl");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(initialError);
    const [createError, setCreateError] = useState<string | null>(initialCreateError);
    const [isPending, startTransition] = useTransition();
    const [currentDevices, setCurrentDevices] = useState<DeviceItem[]>(devices);
    const [currentRawDevices, setCurrentRawDevices] = useState<BackendDevice[]>(rawDevices);
    const [currentBalance, setCurrentBalance] = useState(balance);
    const [currentDevicePrice, setCurrentDevicePrice] = useState(devicePrice);
    const [currentPlatforms, setCurrentPlatforms] = useState<BackendDevicePlatformOption[]>(platforms);
    const [currentCountries, setCurrentCountries] = useState<BackendDeviceCountryOption[]>(countries);
    const [operationState, setOperationState] = useState<DeviceOperationState | null>(null);

    const canCreateDevice = state !== "error" && currentPlatforms.length > 0 && currentCountries.length > 0;

    useEffect(() => {
        setCurrentDevices(devices);
    }, [devices]);

    useEffect(() => {
        setCurrentRawDevices(rawDevices);
    }, [rawDevices]);

    useEffect(() => {
        setCurrentBalance(balance);
    }, [balance]);

    useEffect(() => {
        setCurrentDevicePrice(devicePrice);
    }, [devicePrice]);

    useEffect(() => {
        setCurrentPlatforms(platforms);
    }, [platforms]);

    useEffect(() => {
        setCurrentCountries(countries);
    }, [countries]);

    useEffect(() => {
        setError(initialError);
    }, [initialError]);

    useEffect(() => {
        setCreateError(initialCreateError);
    }, [initialCreateError]);

    useEffect(() => {
        if (initialCreateOpen) {
            setCreateOpen(true);
        }
    }, [initialCreateOpen]);

    useEffect(() => {
        if (currentPlatforms.length && !currentPlatforms.some((item) => item.id === platform)) {
            setPlatform(currentPlatforms[0].id);
        }
    }, [currentPlatforms, platform]);

    useEffect(() => {
        if (currentCountries.length && !currentCountries.some((item) => item.id === country)) {
            setCountry(currentCountries[0].id);
        }
    }, [currentCountries, country]);

    useEffect(() => {
        const controller = new AbortController();

        void (async () => {
            try {
                const response = await fetch("/api/devices/options?include_status=1", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!response.ok) {
                    return;
                }

                const payload = await response.json() as Partial<BackendDeviceCatalog>;
                if (controller.signal.aborted) {
                    return;
                }

                if (typeof payload.device_price === "number" && Number.isFinite(payload.device_price)) {
                    setCurrentDevicePrice(payload.device_price);
                }
                if (Array.isArray(payload.platforms)) {
                    setCurrentPlatforms(payload.platforms);
                }
                if (Array.isArray(payload.countries)) {
                    setCurrentCountries(payload.countries);
                }
            } catch (requestError) {
                if (controller.signal.aborted) {
                    return;
                }
                console.warn("devices catalog refresh failed", requestError);
            }
        })();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!operationState || operationState.mode !== "progress") {
            return;
        }

        const timer = window.setInterval(() => {
            setOperationState((current) => {
                if (!current || current.mode !== "progress") {
                    return current;
                }
                const step = current.progress < 40 ? 12 : current.progress < 70 ? 8 : 4;
                return {
                    ...current,
                    progress: Math.min(current.progress + step, 92),
                };
            });
        }, 220);

        return () => window.clearInterval(timer);
    }, [operationState]);

    function resetNotices() {
        setMessage(null);
        setError(null);
    }

    function resetCreateError() {
        setCreateError(null);
    }

    function startOperation(kind: DeviceOperationKind) {
        setOperationState({
            kind,
            mode: "progress",
            progress: 8,
            title: kind === "create"
                ? "Создаём устройство"
                : kind === "delete"
                    ? "Удаляем устройство"
                    : "Удаляем все ключи",
            description: kind === "create"
                ? "Подготавливаем ключ, сервер и карточку подключения."
                : kind === "delete"
                    ? "Отключаем устройство и очищаем доступ."
                    : "Удаляем все ключи из кабинета и VPN-панели.",
        });
    }

    function completeOperation(kind: DeviceOperationKind) {
        setOperationState({
            kind,
            mode: "success",
            progress: 100,
            title: kind === "create"
                ? "Устройство готово"
                : kind === "delete"
                    ? "Устройство удалено"
                    : "Все ключи удалены",
            description: kind === "create"
                ? "Карточка подключения уже подготовлена. Можно открыть её и установить ключ."
                : kind === "delete"
                    ? "Устройство убрано из кабинета и из VPN-панели."
                    : "Все устройства удалены из кабинета.",
        });
    }

    async function showFriendlyError(options: {
        title: string;
        message: string;
        details: string;
    }) {
        const code = await reportClientIssue({
            title: options.title,
            message: options.message,
            details: options.details,
            path: window.location.pathname,
            portal: "customer",
        });
        setError(code
            ? `Упс, что-то сломалось. Уже чиним. Код ошибки: ${code}.`
            : "Упс, что-то сломалось. Уже чиним.");
    }

    function openCreateModal() {
        resetNotices();
        resetCreateError();
        if (!canCreateDevice) {
            setError("Сейчас не получается открыть подключение устройства. Попробуй обновить страницу.");
            return;
        }
        setCreateOpen(true);
    }

    function submitCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    resetNotices();
                    resetCreateError();
                    startOperation("create");

                    const response = await fetch("/api/devices", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ platform, country }),
                    });

                    const payload = (await response.json().catch(() => ({}))) as Partial<DeviceCreateResponse> & { detail?: string };
                    if (!response.ok || !payload.device) {
                        throw new Error(payload.detail ?? "device_create_failed");
                    }

                    const createdDevice = payload.device;
                    const createdSummary = mapBackendDevice(createdDevice);

                    setCurrentRawDevices((current) => {
                        const next = current.filter((item) => item.id !== createdDevice.id);
                        return [...next, createdDevice];
                    });
                    setCurrentDevices((current) => {
                        const next = current.filter((item) => item.id !== createdSummary.id);
                        return [...next, createdSummary];
                    });
                    setCurrentBalance(typeof payload.balance === "number" ? payload.balance : currentBalance);
                    setSelectedDeviceId(String(createdDevice.id));
                    setCreateOpen(false);
                    setMessage("Устройство создано.");
                    completeOperation("create");
                    router.refresh();
                } catch (requestError) {
                    setOperationState(null);
                    const code = await reportClientIssue({
                        title: "Ошибка создания устройства",
                        message: "Не удалось создать устройство.",
                        details: requestError instanceof Error ? requestError.message : "unknown_device_create_error",
                        path: window.location.pathname,
                        portal: "customer",
                    });
                    setCreateError(code
                        ? `Упс, что-то сломалось. Уже чиним. Код ошибки: ${code}.`
                        : "Упс, что-то сломалось. Уже чиним.");
                }
            })();
        });
    }

    function submitDelete() {
        if (!deleteTarget) {
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    resetNotices();
                    startOperation("delete");

                    const response = await fetch(`/api/devices/${deleteTarget.id}`, {
                        method: "DELETE",
                    });

                    const payload = (await response.json().catch(() => ({}))) as Partial<DeviceDeleteResponse> & { detail?: string };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "device_delete_failed");
                    }

                    setCurrentDevices((current) => current.filter((item) => item.id !== deleteTarget.id));
                    setCurrentRawDevices((current) => current.filter((item) => String(item.id) !== deleteTarget.id));
                    if (typeof payload.balance === "number") {
                        setCurrentBalance(payload.balance);
                    }
                    if (selectedDeviceId === deleteTarget.id) {
                        setSelectedDeviceId(null);
                    }
                    setDeleteTarget(null);
                    setMessage("Устройство удалено.");
                    completeOperation("delete");
                    router.refresh();
                } catch (requestError) {
                    setOperationState(null);
                    void showFriendlyError({
                        title: "Ошибка удаления устройства",
                        message: "Не удалось удалить устройство.",
                        details: requestError instanceof Error ? requestError.message : "unknown_device_delete_error",
                    });
                }
            })();
        });
    }

    function submitDeleteAllKeys() {
        startTransition(() => {
            void (async () => {
                try {
                    resetNotices();
                    startOperation("delete_all");
                    setDeleteAllOpen(false);

                    const response = await fetch("/api/devices/logout-all", {
                        method: "POST",
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        detail?: string;
                        balance?: number;
                        deleted_devices?: number;
                    };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "logout_all_devices_failed");
                    }

                    setCurrentDevices([]);
                    setCurrentRawDevices([]);
                    setSelectedDeviceId(null);
                    if (typeof payload.balance === "number") {
                        setCurrentBalance(payload.balance);
                    }
                    setMessage(`Все ключи удалены. Удалено: ${payload.deleted_devices ?? 0}.`);
                    completeOperation("delete_all");
                    router.refresh();
                } catch (requestError) {
                    setOperationState(null);
                    void showFriendlyError({
                        title: "Ошибка удаления всех ключей",
                        message: "Не удалось удалить все ключи.",
                        details: requestError instanceof Error ? requestError.message : "unknown_logout_all_devices_error",
                    });
                }
            })();
        });
    }

    const effectiveState: ModuleState = useMemo(() => {
        if (state === "error") {
            return "error";
        }
        if (currentDevices.length > 0) {
            return "success";
        }
        return "empty";
    }, [currentDevices.length, state]);

    const selectedDevice = useMemo(
        () => currentRawDevices.find((item) => String(item.id) === selectedDeviceId) ?? null,
        [currentRawDevices, selectedDeviceId]
    );
    const selectedSummary = useMemo(
        () => currentDevices.find((item) => item.id === selectedDeviceId) ?? null,
        [currentDevices, selectedDeviceId]
    );

    const selectedInstallHref = getConfigInstallHref(selectedDevice?.vless_link ?? null, selectedDevice?.platform ?? null);
    const selectedInstructionHref = getInstructionHref(selectedDevice?.platform ?? null);
    const selectedDownloadHref = getAppDownloadHref(selectedDevice?.platform ?? null);
    const selectedQrCodeUrl = getQrCodeUrl(selectedDevice?.vless_link ?? null);
    const selectedCountryOption = useMemo(
        () => currentCountries.find((item) => item.id === country) ?? null,
        [currentCountries, country]
    );
    const selectedDeviceServer = useMemo(
        () => currentCountries.find((item) => item.id === selectedDevice?.country) ?? null,
        [currentCountries, selectedDevice?.country]
    );
    const selectedDeviceLocationLabel = selectedDeviceServer
        ? `${selectedDeviceServer.flag ? `${selectedDeviceServer.flag} ` : ""}${selectedDeviceServer.label}`
        : selectedDevice?.country_label ?? getCountryLabel(selectedDevice?.country ?? null);

    return (
        <>
            {message && (
                <div className="mb-6 rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {currentCountries.length > 0 && (
                <section className="mb-6 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Серверы TUANET</h2>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {currentCountries.map((item) => (
                            <ServerStatusCard key={item.id} country={item} />
                        ))}
                    </div>
                </section>
            )}

            <DevicesTable
                devices={currentDevices}
                state={effectiveState}
                onDeleteAllKeys={() => setDeleteAllOpen(true)}
                onCreateDevice={openCreateModal}
                onDeleteDevice={(device) => {
                    resetNotices();
                    setDeleteTarget(device);
                }}
                onSelectDevice={(device) => setSelectedDeviceId(device.id)}
                selectedDeviceId={selectedDeviceId}
                isMutating={isPending}
                canCreateDevice={canCreateDevice}
            />

            <Modal
                open={deleteAllOpen}
                onClose={() => setDeleteAllOpen(false)}
                title="Удалить все ключи"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={submitDeleteAllKeys}
                            disabled={isPending}
                            className="h-11 rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-zinc-800 disabled:opacity-60"
                        >
                            {isPending ? "Удаляем..." : "Удалить все ключи"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteAllOpen(false)}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Отмена
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-lg">
                        Все устройства будут удалены из кабинета.
                    </p>
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-600">
                        Действие необратимо. Если устройства снова понадобятся, ключи нужно будет создать заново.
                    </div>
                </div>
            </Modal>

            <Modal
                open={createOpen}
                onClose={() => !isPending && setCreateOpen(false)}
                title="Подключить устройство"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            form="device-create-form"
                            disabled={isPending || !currentPlatforms.length || !currentCountries.length}
                            className="h-11 rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-zinc-800 disabled:opacity-60"
                        >
                            {isPending ? "Создаём..." : "Создать устройство"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(false)}
                            disabled={isPending}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2 disabled:opacity-60"
                            )}
                        >
                            Отмена
                        </button>
                    </div>
                }
            >
                <form id="device-create-form" className="space-y-6" onSubmit={submitCreate}>
                    <div className="rounded-3xl border-2 border-white/10 bg-black/10 p-5">
                        <div className="text-xs font-bold uppercase tracking-normal text-black/50">
                            Баланс и тариф
                        </div>
                        <div className="mt-3 text-lg font-semibold">
                            На балансе: <span className="font-black">{currentBalance.toFixed(2)} ₽</span>
                        </div>
                        <div className="text-sm text-black/60">
                            Списание за новое устройство: {currentDevicePrice.toFixed(2)} ₽ в день
                        </div>
                    </div>

                    {!canCreateDevice && (
                        <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                            Параметры подключения пока не загрузились. Закрой окно, обнови страницу и попробуй ещё раз.
                        </div>
                    )}

                    {createError && (
                        <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/10 p-5 text-red-700">
                            <div className="text-sm font-black uppercase tracking-normal">
                                😔 Не получилось создать устройство
                            </div>
                            <div className="mt-2 text-sm leading-relaxed">
                                {createError}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-2">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-normal text-black/50">Платформа</span>
                            <select
                                value={platform}
                                onChange={(event) => setPlatform(event.target.value)}
                                disabled={!currentPlatforms.length}
                                className="h-12 rounded-2xl border-2 border-black/10 bg-white px-4 text-sm font-semibold"
                            >
                                {!currentPlatforms.length && <option value="">Нет данных</option>}
                                {currentPlatforms.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-normal text-black/50">Сервер</span>
                            <select
                                value={country}
                                onChange={(event) => setCountry(event.target.value)}
                                disabled={!currentCountries.length}
                                className="h-12 rounded-2xl border-2 border-black/10 bg-white px-4 text-sm font-semibold"
                            >
                                {!currentCountries.length && <option value="">Нет данных</option>}
                                {currentCountries.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.flag} {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4 text-sm text-black/70">
                        После создания устройство появится в кабинете. Откроется карточка с QR-кодом, ссылкой и кнопками установки.
                    </div>

                    {selectedCountryOption && (
                        <ServerStatusCard country={selectedCountryOption} compact />
                    )}
                </form>
            </Modal>

            <Modal
                open={Boolean(deleteTarget)}
                onClose={() => !isPending && setDeleteTarget(null)}
                title="Удалить устройство"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={submitDelete}
                            disabled={isPending || !deleteTarget}
                            className="h-11 rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-zinc-800 disabled:opacity-60"
                        >
                            {isPending ? "Удаляем..." : "Удалить"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isPending}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2 disabled:opacity-60"
                            )}
                        >
                            Отмена
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-lg">
                        Устройство <span className="font-black uppercase">{deleteTarget?.name}</span> будет удалено из аккаунта и из VPN-панели.
                    </p>
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                        Действие необратимо. Если устройство ещё понадобится, его нужно будет создать заново.
                    </div>
                </div>
            </Modal>

            <Modal
                open={Boolean(operationState)}
                onClose={() => {
                    if (operationState?.mode === "success") {
                        setOperationState(null);
                    }
                }}
                title={operationState?.title ?? "Обрабатываем запрос"}
                canClose={operationState?.mode === "success"}
                footer={
                    <div className="flex min-h-11 flex-wrap gap-3">
                        {operationState?.mode === "success" ? (
                            <button
                                type="button"
                                onClick={() => setOperationState(null)}
                                className="h-11 rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-zinc-800"
                            >
                                {operationState.kind === "create" ? "Открыть устройство" : "Готово"}
                            </button>
                        ) : null}
                    </div>
                }
            >
                <div className="min-h-[170px] space-y-6 sm:min-h-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/tuanet-logo.jpeg"
                                alt="TUANET icon"
                                className="h-10 w-10"
                            />
                        </div>
                        <div>
                            <div className="text-lg font-black uppercase tracking-tight">{operationState?.title}</div>
                            <div className="text-sm text-black/60">{operationState?.description}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-3 overflow-hidden rounded-full bg-black/10">
                            <div
                                className="h-full rounded-full bg-black transition-[width] duration-200"
                                style={{ width: `${operationState?.progress ?? 0}%` }}
                            />
                        </div>
                        <div className="text-right text-sm font-semibold text-black/55">
                            {operationState?.progress ?? 0}%
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                open={Boolean(selectedDevice) && !operationState}
                onClose={() => setSelectedDeviceId(null)}
                title={selectedSummary?.name ?? "Устройство"}
                size="lg"
                footer={
                    <div className="flex flex-wrap gap-3">
                        {selectedInstallHref && (
                            <a
                                href={selectedInstallHref}
                                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-zinc-800"
                            >
                                Установить ключ
                            </a>
                        )}
                        <Link
                            href={selectedInstructionHref}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Инструкция
                        </Link>
                        <a
                            href={selectedDownloadHref}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Скачать приложение
                        </a>
                    </div>
                }
            >
                {selectedDevice && (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
                        <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Страна</div>
                                    <div className="mt-2 text-lg font-black">{selectedDeviceLocationLabel}</div>
                                </div>
                                <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Платформа</div>
                                    <div className="mt-2 text-lg font-black">{selectedSummary?.platform ?? selectedDevice.platform ?? "Не указана"}</div>
                                </div>
                                <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Дата создания</div>
                                    <div className="mt-2 text-lg font-black">{selectedSummary?.connectedAt ?? "Нет данных"}</div>
                                </div>
                                <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Последняя активность</div>
                                    <div className="mt-2 text-lg font-black">{selectedSummary?.lastActive ?? "Нет данных"}</div>
                                </div>
                            </div>

                            <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-5">
                                <div className="text-xs font-bold uppercase tracking-normal text-black/45">Идентификатор подключения</div>
                                <div className="mt-2 text-base font-black uppercase tracking-tight">
                                    {selectedDevice.marzban_username ?? "Не назначен"}
                                </div>
                            </div>

                            {selectedDeviceServer && (
                                <ServerStatusCard country={selectedDeviceServer} compact />
                            )}

                            <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-xs font-bold uppercase tracking-normal text-black/45">Ключ доступа</div>
                                    {selectedDevice.vless_link && (
                                        <button
                                            type="button"
                                            onClick={() => void navigator.clipboard.writeText(selectedDevice.vless_link ?? "")}
                                            className="rounded-full border-2 border-black/10 px-3 py-1 text-xs font-bold uppercase tracking-normal"
                                        >
                                            Копировать
                                        </button>
                                    )}
                                </div>
                                <div className="mt-3 overflow-hidden rounded-2xl border-2 border-black/10 bg-white p-4">
                                    <code className="block break-all text-xs leading-relaxed text-black/80">
                                        {selectedDevice.vless_link ?? "Ссылка ещё не готова"}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 lg:max-w-[360px] lg:justify-self-end">
                                <BrandedQrCard
                                    qrCodeUrl={selectedQrCodeUrl}
                                    title={selectedSummary?.name ?? "TUANET ACCESS"}
                                    subtitle={selectedDeviceLocationLabel}
                                    accentLabel={(selectedSummary?.platform ?? selectedDevice.platform ?? "VLESS").toUpperCase()}
                                    className="mx-auto w-full max-w-[320px] sm:max-w-none"
                                    compact
                                />

                            <div className="flex min-h-[96px] items-center rounded-3xl border-2 border-black/10 bg-black/5 px-5 py-4 text-sm leading-relaxed text-black/70">
                                Установи приложение, затем импортируй подключение по QR-коду или по ссылке.
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
