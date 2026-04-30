"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AccessKeyView, getInstructionHref } from "@/lib/backend";
import { ModuleState } from "@/components/account/KeysTable";

interface AccessKeysPanelProps {
    keys: AccessKeyView[];
    state: ModuleState;
}

const statusLabel: Record<AccessKeyView["status"], string> = {
    ready: "Готов",
    pending: "Готовится",
    limited: "Ограничен",
    offline: "Неактивен",
};

export function AccessKeysPanel({ keys, state }: AccessKeysPanelProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copyError, setCopyError] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    function handleCopy(key: AccessKeyView) {
        if (!key.value) {
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setCopyError(null);
                    await navigator.clipboard.writeText(key.value!);
                    setCopiedId(key.id);
                    window.setTimeout(() => setCopiedId((current) => (current === key.id ? null : current)), 2000);
                } catch {
                    setCopyError("Не удалось скопировать ссылку. Попробуй ещё раз.");
                }
            })();
        });
    }

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Ключи доступа</h2>
                        <p className="text-base font-medium leading-relaxed text-white/40">
                            Ссылки и ключи для уже добавленных устройств.
                        </p>
                    </div>
                    <Link
                        href="/download"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-10 px-4 text-xs uppercase tracking-normal border-2"
                        )}
                    >
                        Открыть инструкции
                    </Link>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-16 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка ключей…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Ошибка ключей</div>
                        <p className="mt-2 text-lg">Не удалось получить ссылки подключения.</p>
                    </div>
                )}

                {state === "empty" && (
                    <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-8 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Ключей пока нет</h3>
                        <p className="mt-3 text-base font-medium leading-relaxed text-white/40">
                            Как только появится первое устройство, здесь будут его ссылки доступа.
                        </p>
                    </div>
                )}

                {state === "success" && (
                    <>
                        <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-4 text-sm text-white/70">
                            Здесь можно просматривать и копировать ссылки доступа для уже добавленных устройств.
                        </div>

                        {copyError && (
                            <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                                {copyError}
                            </div>
                        )}

                        <div className="overflow-hidden rounded-3xl border-2 border-white/10">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-normal text-white/40">
                                        <tr>
                                            <th className="px-4 py-3">Устройство</th>
                                            <th className="px-4 py-3">Логин</th>
                                            <th className="px-4 py-3">Создан</th>
                                            <th className="px-4 py-3">Последняя активность</th>
                                            <th className="px-4 py-3">Статус</th>
                                            <th className="px-4 py-3 text-right">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keys.map((key) => (
                                            <tr key={key.id} className="border-t border-white/10">
                                                <td className="px-4 py-4">
                                                    <div className="text-base font-bold uppercase tracking-tight">{key.name}</div>
                                                    <div className="text-xs uppercase tracking-normal text-white/40">
                                                        {key.platform}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-white/70">{key.username}</td>
                                                <td className="px-4 py-4 text-white/70">{key.createdAt}</td>
                                                <td className="px-4 py-4 text-white/70">{key.lastActive}</td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={cn(
                                                            "rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-normal",
                                                            key.status === "ready" && "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
                                                            key.status === "pending" && "border-brand/40 bg-brand/10 text-brand-100",
                                                            key.status === "limited" && "border-red-400/40 bg-red-500/10 text-red-200",
                                                            key.status === "offline" && "border-white/20 bg-white/10 text-white/60"
                                                        )}
                                                    >
                                                        {statusLabel[key.status]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {key.value ? (
                                                            <>
                                                                <Link
                                                                    href={getInstructionHref(key.platform)}
                                                                    className="rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal text-white/80"
                                                                >
                                                                    Инструкция
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(key)}
                                                                    className="rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                                                >
                                                                    {copiedId === key.id ? "Скопировано" : "Копировать"}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <Link
                                                                href="/account/devices"
                                                                className="rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal text-white/70"
                                                            >
                                                                К устройству
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
