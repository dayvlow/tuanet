"use client";

import { useState } from "react";
import { SessionItem } from "@/lib/account-types";
import { buttonVariants } from "@/components/ui/Button";
import { Modal } from "@/components/account/Modal";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface SecurityPanelProps {
    sessions: SessionItem[];
    state?: ModuleState;
    emailVerified?: boolean;
}

export function SecurityPanel({
    sessions,
    state = "success",
    emailVerified = false,
}: SecurityPanelProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionList, setSessionList] = useState(sessions);
    const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
    const [notice, setNotice] = useState("");
    const [deleteNotice, setDeleteNotice] = useState("");

    async function terminateSession(sessionId: string) {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            const { error } = await supabase.from("account_sessions").delete().eq("id", sessionId);

            if (error) {
                setNotice("Не удалось завершить сессию. Попробуйте еще раз.");
                return;
            }
        }

        setSessionList((current) => current.filter((session) => session.id !== sessionId));
        setNotice("Сессия завершена.");
    }

    async function terminateAll() {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            const { error } = await supabase
                .from("account_sessions")
                .delete()
                .eq("is_current", false);

            if (error) {
                setNotice("Не удалось завершить дополнительные сессии. Попробуйте еще раз.");
                return;
            }
        }

        setSessionList((current) => current.filter((session) => session.current));
        setNotice("Все дополнительные сессии завершены.");
    }

    async function requestDeleteAccount() {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            const { error } = await supabase.from("account_deletion_requests").insert({
                reason: "DELETE",
            });

            if (error) {
                setDeleteNotice("Не удалось отправить запрос. Попробуйте еще раз чуть позже.");
                setDeleteConfirmValue("");
                setShowDeleteModal(false);
                return;
            }
        }

        setDeleteNotice("Запрос подготовлен. Для завершения удаления свяжитесь с поддержкой.");
        setDeleteConfirmValue("");
        setShowDeleteModal(false);
    }

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Безопасность</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Двухфакторная защита, сессии и контроль доступа.</p>
                </div>

                {notice && <div className="rounded-2xl border-2 border-white/10 bg-white/5 p-4 text-sm text-white/70">{notice}</div>}
                {deleteNotice && <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{deleteNotice}</div>}

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загружаем настройки безопасности…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Не удалось загрузить настройки</div>
                        <p className="mt-2 text-lg">Попробуй обновить страницу чуть позже.</p>
                    </div>
                )}

                {state === "success" && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border-2 border-white/10 p-5">
                            <div className="text-sm font-medium tracking-normal text-white/50">Подтверждение аккаунта</div>
                            <div className="mt-3 flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-bold">
                                        {emailVerified ? "Email подтвержден" : "Email не подтвержден"}
                                    </div>
                                    <p className="text-sm text-white/60">
                                        {emailVerified
                                            ? "Аккаунт уже готов к обычному входу."
                                            : "Подтвердите почту, чтобы не потерять доступ к аккаунту."}
                                    </p>
                                </div>
                                <Link
                                    href="/account/profile"
                                    className="inline-flex h-9 items-center rounded-full border-2 border-white/20 px-3 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                >
                                    {emailVerified ? "Открыть профиль" : "Проверить профиль"}
                                </Link>
                            </div>
                            <div className="mt-4 rounded-2xl border-2 border-white/10 bg-white/5 p-3 text-xs uppercase tracking-normal text-white/50">
                                {emailVerified
                                    ? "Если смените почту, подтверждение потребуется снова."
                                    : "Письмо для подтверждения можно отправить из профиля."}
                            </div>
                        </div>

                        <div className="rounded-3xl border-2 border-white/10 p-5">
                            <div className="text-sm font-medium tracking-normal text-white/50">Устройства в кабинете</div>
                            <div className="mt-4 space-y-3">
                                {sessionList.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-normal">{session.device}</div>
                                            <div className="text-xs text-white/50">{session.location} • {session.lastActive}</div>
                                        </div>
                                        {session.current ? (
                                            <span className="rounded-full border-2 border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-normal text-white/60">
                                                Текущее
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => void terminateSession(session.id)}
                                                className="rounded-full border-2 border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                            >
                                                Убрать
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {sessionList.length === 0 && <div className="text-sm text-white/50">Список устройств пока пуст.</div>}
                            </div>
                            <button
                                type="button"
                                onClick={() => void terminateAll()}
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "mt-4 h-9 px-3 text-xs uppercase tracking-normal border-2"
                                )}
                            >
                                Очистить список
                            </button>
                        </div>

                        <div className="rounded-3xl border-2 border-white/10 p-5 lg:col-span-2">
                            <div className="text-sm font-medium tracking-normal text-white/50">Помощь и статус</div>
                            <div className="mt-4 space-y-3 text-sm">
                                <Link href="/download/windows" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold">Инструкция Windows</Link>
                                <Link href="/download/ios" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold">Инструкция iOS</Link>
                                <Link href="/download/android" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold">Инструкция Android</Link>
                                <Link href="/help#contact" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold">Написать в поддержку</Link>
                                <Link href="/status" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold">Статус сервиса</Link>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/5 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-sm font-medium tracking-normal text-red-400">Опасная зона</div>
                            <div className="mt-2 text-lg font-semibold text-white">Удаление аккаунта</div>
                            <p className="text-sm text-white/60">После удаления восстановить аккаунт и данные не получится.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="rounded-full border-2 border-red-500/40 px-4 py-2 text-xs font-bold uppercase tracking-normal text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Удалить аккаунт
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmValue("");
                }}
                title="Удалить аккаунт"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => void requestDeleteAccount()}
                            disabled={deleteConfirmValue !== "DELETE"}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal",
                                deleteConfirmValue !== "DELETE" && "pointer-events-none opacity-50"
                            )}
                        >
                            Подтвердить удаление
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteConfirmValue("");
                            }}
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
                        Это действие нельзя отменить. Для подтверждения введи слово <span className="font-bold">DELETE</span>.
                    </p>
                    <input
                        type="text"
                        value={deleteConfirmValue}
                        onChange={(event) => setDeleteConfirmValue(event.target.value)}
                        placeholder="DELETE"
                        className="h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                    />
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-400">
                        После удаления будут потеряны доступы, ключи и история активности.
                    </div>
                </div>
            </Modal>
        </section>
    );
}
