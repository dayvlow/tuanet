"use client";

import { useMemo } from "react";
import { KeyItem, KeyStatus } from "@/lib/account-fixtures";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ModuleState = "success" | "loading" | "empty" | "error";

interface KeysTableProps {
    keys: KeyItem[];
    state?: ModuleState;
    onCreate?: () => void;
    onRevoke?: (key: KeyItem) => void;
}

const statusLabel: Record<KeyStatus, string> = {
    active: "Активен",
    revoked: "Отозван",
    expiring: "Истекает",
    rotating: "Ротация",
};

export function KeysTable({ keys, state = "success", onCreate, onRevoke }: KeysTableProps) {
    const rows = useMemo(() => keys, [keys]);

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Ключи доступа</h2>
                        <p className="text-base font-medium leading-relaxed text-white/40">API keys, device keys, access tokens</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onCreate}
                            className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Создать ключ
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <input
                        type="search"
                        aria-label="Поиск по ключам"
                        placeholder="Поиск по названию или последним символам"
                        className="h-12 flex-1 rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold placeholder:text-white/40"
                    />
                    <div className="flex flex-wrap gap-3">
                        {["active", "expiring", "revoked"].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className="rounded-full border-2 border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                {filter === "active" ? "Активные" : filter === "expiring" ? "Истекают" : "Отозванные"}
                            </button>
                        ))}
                        <select aria-label="Сортировка ключей" className="h-12 rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-xs font-bold uppercase tracking-normal">
                            <option>Сортировка: активность</option>
                            <option>Сортировка: дата создания</option>
                        </select>
                    </div>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка ключей…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-600">Ошибка загрузки ключей</div>
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
                        <h3 className="text-2xl font-black uppercase tracking-tight">Ключей пока нет</h3>
                        <p className="mt-3 text-base font-medium leading-relaxed text-white/40">
                            Создай ключ для подключения устройств
                        </p>
                        <button
                            type="button"
                            onClick={onCreate}
                            className="mt-6 h-10 rounded-full border-2 border-white/20 px-5 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Создать ключ
                        </button>
                    </div>
                )}

                {state === "success" && (
                    <div className="overflow-hidden rounded-3xl border-2 border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-white/5 text-xs uppercase tracking-normal text-white/40">
                                <tr>
                                    <th className="px-4 py-3">Ключ</th>
                                    <th className="px-4 py-3">Создан</th>
                                    <th className="px-4 py-3">Последняя активность</th>
                                    <th className="px-4 py-3">Статус</th>
                                    <th className="px-4 py-3 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((key) => (
                                    <tr key={key.id} className="border-t border-white/10">
                                        <td className="px-4 py-4">
                                            <div className="text-base font-bold uppercase tracking-tight">{key.name}</div>
                                            <div className="text-xs uppercase tracking-normal text-white/40">
                                                {key.type} • •••• {key.last4}
                                            </div>
                                            {key.expiresAt && (
                                                <div className="text-xs text-white/50">Старый ключ отключится {key.expiresAt}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-white/70">{key.createdAt}</td>
                                        <td className="px-4 py-4 text-white/70">{key.lastActive}</td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={cn(
                                                    "rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-normal",
                                                    key.status === "active" && "border-white/20 bg-white/5",
                                                    key.status === "rotating" && "border-brand bg-brand/20",
                                                    key.status === "expiring" && "border-orange-400 bg-orange-100",
                                                    key.status === "revoked" && "border-white/20 bg-white/10 text-white/50"
                                                )}
                                            >
                                                {statusLabel[key.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                                >
                                                    Копировать
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onRevoke?.(key)}
                                                    className="rounded-full border-2 border-red-300/30 px-3 py-2 text-xs font-bold uppercase tracking-normal text-red-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                                >
                                                    Отозвать
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
