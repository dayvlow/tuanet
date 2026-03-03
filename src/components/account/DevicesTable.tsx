"use client";

import { DeviceItem } from "@/lib/account-fixtures";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";
import { DeviceActions } from "@/components/account/DeviceActions";

interface DevicesTableProps {
    devices: DeviceItem[];
    deviceLimit: number;
    state?: ModuleState;
    onLogoutAll?: () => void;
}

export function DevicesTable({ devices, deviceLimit, state = "success", onLogoutAll }: DevicesTableProps) {
    const reachedLimit = devices.length >= deviceLimit;

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Устройства</h2>
                        <p className="text-base font-medium leading-relaxed text-white/40">Контроль подключений и лимитов</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onLogoutAll}
                            className="h-10 rounded-full border-2 border-red-300/30 px-4 text-xs font-bold uppercase tracking-normal text-red-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Выйти со всех
                        </button>
                        <button
                            type="button"
                            className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Подключить устройство
                        </button>
                    </div>
                </div>

                <div className={cn(
                    "rounded-3xl border-2 p-4",
                    reachedLimit ? "border-brand bg-brand/10" : "border-white/10 bg-black/20"
                )}>
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-normal text-white/50">Лимит устройств</div>
                            <div className="text-2xl font-black">
                                {devices.length} из {deviceLimit}
                            </div>
                        </div>
                        {reachedLimit && (
                            <div className="text-sm font-semibold text-white">
                                Лимит достигнут. Отключи старое устройство, чтобы подключить новое.
                            </div>
                        )}
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
                        <p className="mt-3 text-base font-medium leading-relaxed text-white/40">
                            Скачай приложение и подключи устройство
                        </p>
                        <button
                            type="button"
                            className="mt-6 h-10 rounded-full border-2 border-white/20 px-5 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Скачать приложение
                        </button>
                    </div>
                )}

                {state === "success" && (
                    <div className="space-y-4">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className="flex flex-col gap-4 rounded-3xl border-2 border-white/10 bg-black/20 p-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div>
                                    <div className="text-lg font-black uppercase tracking-tight">{device.name}</div>
                                    <div className="text-xs uppercase tracking-normal text-white/40">
                                        {device.platform} • {device.location ?? "Локация не указана"}
                                    </div>
                                    <div className="text-sm text-white/60">Подключено: {device.connectedAt}</div>
                                    <div className="text-sm text-white/60">Последняя активность: {device.lastActive}</div>
                                    <div className="text-xs uppercase tracking-normal text-white/40">{device.keyLabel}</div>
                                </div>
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
                                    <DeviceActions />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
