"use client";

import { DeviceItem } from "@/lib/account-fixtures";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";
import { DeviceActions } from "@/components/account/DeviceActions";

interface DevicesTableProps {
    devices: DeviceItem[];
    state?: ModuleState;
    onDeleteAllKeys?: () => void;
    onCreateDevice?: () => void;
    onDeleteDevice?: (device: DeviceItem) => void;
    onSelectDevice?: (device: DeviceItem) => void;
    selectedDeviceId?: string | null;
    isMutating?: boolean;
    canCreateDevice?: boolean;
}

export function DevicesTable({
    devices,
    state = "success",
    onDeleteAllKeys,
    onCreateDevice,
    onDeleteDevice,
    onSelectDevice,
    selectedDeviceId,
    isMutating = false,
    canCreateDevice = true,
}: DevicesTableProps) {
    const createDisabled = isMutating || !canCreateDevice;

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Устройства</h2>
                        <p className="text-base font-medium leading-relaxed text-white/40">Контроль подключений и активных устройств</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onDeleteAllKeys}
                            disabled={isMutating || devices.length === 0}
                            className="h-10 rounded-full border-2 border-red-300/30 px-4 text-xs font-bold uppercase tracking-normal text-red-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            Удалить все ключи
                        </button>
                        <button
                            type="button"
                            onClick={onCreateDevice}
                            disabled={createDisabled}
                            className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isMutating ? "Обновляем..." : "Подключить устройство"}
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-normal text-white/50">Подключено устройств</div>
                            <div className="text-2xl font-black">{devices.length}</div>
                        </div>
                    </div>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка устройств…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-600">Ошибка загрузки устройств</div>
                        <p className="mt-2 text-lg">Не удалось получить список. Проверь соединение и повтори.</p>
                        <button
                            type="button"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "mt-4 h-10 px-4 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Повторить
                        </button>
                    </div>
                )}

                {state === "empty" && (
                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-8 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Устройств нет</h3>
                    </div>
                )}

                {state === "success" && (
                    <div className="space-y-4">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className={cn(
                                    "flex flex-col gap-4 rounded-3xl border-2 bg-black/20 p-5 lg:flex-row lg:items-center lg:justify-between",
                                    selectedDeviceId === device.id ? "border-brand/60" : "border-white/10"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelectDevice?.(device)}
                                    className="flex-1 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                >
                                    <div className="text-lg font-black uppercase tracking-tight">{device.name}</div>
                                    <div className="text-xs uppercase tracking-normal text-white/40">
                                        {device.platform} • {device.location ?? "Локация не указана"}
                                    </div>
                                    <div className="text-sm text-white/60">Подключено: {device.connectedAt}</div>
                                    <div className="text-sm text-white/60">Последняя активность: {device.lastActive}</div>
                                    <div className="text-xs uppercase tracking-normal text-white/40">{device.keyLabel}</div>
                                </button>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={cn(
                                            "rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-normal",
                                            device.status === "active" && "border-white/20 bg-white/5",
                                            device.status === "offline" && "border-white/20 bg-white/10 text-white/50",
                                            device.status === "revoked" && "border-red-500/30 bg-red-500/10 text-red-400"
                                        )}
                                    >
                                        {device.status === "active" ? "Активно" : device.status === "offline" ? "Offline" : "Отозвано"}
                                    </span>
                                    <DeviceActions
                                        onDanger={() => onDeleteDevice?.(device)}
                                        disabled={isMutating}
                                        dangerLabel="Удалить"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
