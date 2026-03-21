"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyItem, KeyStatus } from "@/lib/account-fixtures";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ModuleState = "success" | "loading" | "empty" | "error";

type KeyFilter = "all" | "active" | "expiring" | "revoked";
type SortMode = "activity" | "created";

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
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<KeyFilter>("all");
    const [sortMode, setSortMode] = useState<SortMode>("activity");
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const rows = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        const filtered = keys.filter((key) => {
            if (activeFilter === "active" && !["active", "rotating"].includes(key.status)) {
                return false;
            }

            if (activeFilter === "expiring" && key.status !== "expiring") {
                return false;
            }

            if (activeFilter === "revoked" && key.status !== "revoked") {
                return false;
            }

            if (!normalized) {
                return true;
            }

            return key.name.toLowerCase().includes(normalized) || key.last4.toLowerCase().includes(normalized);
        });

        if (sortMode === "created") {
            return [...filtered].reverse();
        }

        return filtered;
    }, [activeFilter, keys, search, sortMode]);

    async function handleCopy(key: KeyItem) {
        const value = `tuaanet-${key.id}-${key.last4}`;
        await navigator.clipboard.writeText(value);
        setCopiedKeyId(key.id);
        window.setTimeout(() => setCopiedKeyId((current) => (current === key.id ? null : current)), 1500);
    }

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Ключи доступа</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Все ключи, статусы и действия по ним собраны в одном месте.</p>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <input
                        type="search"
                        aria-label="Поиск по ключам"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по названию или последним символам"
                        className="h-12 flex-1 rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold placeholder:text-white/40"
                    />
                    <div className="flex flex-wrap gap-3">
                        {[
                            { id: "all", label: "Все" },
                            { id: "active", label: "Активные" },
                            { id: "expiring", label: "Истекают" },
                            { id: "revoked", label: "Отозванные" },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setActiveFilter(filter.id as KeyFilter)}
                                className={cn(
                                    "rounded-full border-2 border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-normal text-white transition-colors hover:border-brand hover:bg-brand hover:text-white active:border-brand active:bg-brand active:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                                    activeFilter === filter.id && "border-brand bg-brand text-white"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                        <select
                            aria-label="Сортировка ключей"
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as SortMode)}
                            className="h-12 rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-xs font-bold uppercase tracking-normal"
                        >
                            <option value="activity">Сортировка: активность</option>
                            <option value="created">Сортировка: создание</option>
                        </select>
                    </div>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загружаем ключи…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-600">Не удалось загрузить ключи</div>
                        <p className="mt-2 text-lg">Проверь соединение и попробуй еще раз.</p>
                        <button
                            type="button"
                            onClick={() => router.refresh()}
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
                            Создай первый ключ, чтобы подключить устройство.
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
                                    {rows.length === 0 && (
                                        <tr className="border-t border-white/10">
                                            <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                                                По этим параметрам ничего не найдено.
                                            </td>
                                        </tr>
                                    )}
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
                                                        key.status === "expiring" && "border-orange-400 bg-orange-100 text-black",
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
                                                        onClick={() => void handleCopy(key)}
                                                        className="rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                                    >
                                                        {copiedKeyId === key.id ? "Скопировано" : "Копировать"}
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
                                    <tr className="border-t border-white/10">
                                        <td colSpan={5} className="p-0">
                                            <button
                                                type="button"
                                                onClick={onCreate}
                                                className="flex w-full items-center justify-center px-4 py-5 text-sm font-bold uppercase tracking-normal text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/60"
                                            >
                                                Создать ключ
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
