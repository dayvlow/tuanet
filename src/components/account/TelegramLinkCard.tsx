"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { getQrCodeUrl, type BackendAccountPortal } from "@/lib/backend";
import { appendPortalQuery } from "@/lib/session-portal";
import { cn } from "@/lib/utils";

interface TelegramLinkCardProps {
    telegramExternalId?: string | null;
    telegramUsername?: string | null;
    portal?: BackendAccountPortal;
}

interface LinkSessionPayload {
    token: string;
    code: string;
    deepLink: string;
    expiresAt: string;
}

type LinkStatus = "idle" | "pending" | "confirmed" | "error";

export function TelegramLinkCard({ telegramExternalId, telegramUsername, portal }: TelegramLinkCardProps) {
    const router = useRouter();
    const [status, setStatus] = useState<LinkStatus>(telegramExternalId ? "confirmed" : "idle");
    const [session, setSession] = useState<LinkSessionPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const qrCodeUrl = getQrCodeUrl(session?.deepLink ?? null);

    useEffect(() => {
        if (!session || status !== "pending") {
            return;
        }

        const timer = window.setInterval(async () => {
            try {
                const response = await fetch(
                    appendPortalQuery(`/api/link/telegram/status?token=${encodeURIComponent(session.token)}`, portal),
                    {
                        cache: "no-store",
                    },
                );
                const payload = (await response.json().catch(() => ({}))) as {
                    detail?: string;
                    failed_attempts?: number;
                    status?: string;
                };

                if (!response.ok) {
                    throw new Error(payload.detail ?? "Не удалось проверить статус привязки");
                }

                if (payload.status === "confirmed") {
                    setStatus("confirmed");
                    setSession(null);
                    router.refresh();
                    return;
                }

                if (payload.status === "expired") {
                    setStatus("error");
                    setSession(null);
                    setError("Запрос привязки истек или был отменен. Создай новый на сайте.");
                }
            } catch (requestError) {
                setStatus("error");
                setSession(null);
                setError(requestError instanceof Error ? requestError.message : "Не удалось проверить привязку");
            }
        }, 3000);

        return () => window.clearInterval(timer);
    }, [portal, router, session, status]);

    useEffect(() => {
        if (!session) {
            setShowQrModal(false);
        }
    }, [session]);

    function startLinking() {
        startTransition(() => {
            void (async () => {
                try {
                    setError(null);
                    const response = await fetch(appendPortalQuery("/api/link/telegram/start", portal), {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            returnUrl: window.location.href,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        detail?: string;
                        token: string;
                        code: string;
                        deepLink: string;
                        expires_at?: string;
                        expiresAt?: string;
                    };

                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось создать запрос привязки");
                    }

                    setSession({
                        token: payload.token,
                        code: payload.code,
                        deepLink: payload.deepLink,
                        expiresAt: payload.expiresAt ?? payload.expires_at ?? "",
                    });
                    setStatus("pending");
                } catch (requestError) {
                    setStatus("error");
                    setSession(null);
                    setError(requestError instanceof Error ? requestError.message : "Не удалось начать привязку");
                }
            })();
        });
    }

    function unlinkTelegram() {
        const approved = window.confirm(
            "Отвязать Telegram? После этого в боте аккаунт начнётся с чистого состояния, а данные останутся в текущем сайте-аккаунте."
        );
        if (!approved) {
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setError(null);
                    const response = await fetch(appendPortalQuery("/api/link/telegram/unlink", portal), {
                        method: "DELETE",
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        detail?: string;
                    };

                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось отвязать Telegram");
                    }

                    setStatus("idle");
                    setSession(null);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось отвязать Telegram");
                }
            })();
        });
    }

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Telegram</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">
                        Привяжи бота к сайту, чтобы один аккаунт работал везде одинаково.
                    </p>
                </div>

                {status === "confirmed" && telegramExternalId && (
                    <div className="space-y-4">
                        <div className="rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/10 p-6">
                            <div className="text-sm font-bold uppercase tracking-normal text-emerald-300">Привязано</div>
                            <div className="mt-2 text-lg font-semibold">
                                {telegramUsername ? `@${telegramUsername}` : `Telegram ${telegramExternalId}`}
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                                Этот Telegram уже связан с текущим аккаунтом.
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={unlinkTelegram}
                                    disabled={isPending}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "sm" }),
                                        "h-11 border-2 border-red-500/30 px-5 text-xs uppercase tracking-normal text-red-200 hover:border-red-400/40 hover:bg-red-500/10 disabled:opacity-60"
                                    )}
                                >
                                    {isPending ? "Отвязываем..." : "Отвязать Telegram"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {status !== "confirmed" && (
                    <div className="space-y-4">
                        <div className="rounded-3xl border-2 border-white/10 bg-black/20 p-5 text-sm text-white/70">
                            1. Нажми кнопку ниже.
                            <br />
                            2. Открой бота по ссылке.
                            <br />
                            3. Введи в боте код, который показан на сайте.
                        </div>

                        {session && status === "pending" && (
                            <div className="rounded-3xl border-2 border-brand/30 bg-brand/10 p-5">
                                <div className="text-xs font-bold uppercase tracking-normal text-white/60">Код привязки</div>
                                <div className="mt-2 text-3xl font-black tracking-tight">{session.code}</div>
                                <div className="mt-2 text-sm text-white/60">
                                    После ввода кода в боте страница обновится автоматически.
                                </div>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={session.deepLink}
                                        className={cn(
                                            buttonVariants({ variant: "brand", size: "sm" }),
                                            "h-11 px-5 text-xs uppercase tracking-normal"
                                        )}
                                    >
                                        Открыть Telegram
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setShowQrModal(true)}
                                        className={cn(
                                            buttonVariants({ variant: "outline", size: "sm" }),
                                            "h-11 px-5 text-xs uppercase tracking-normal border-2"
                                        )}
                                    >
                                        Продолжить по QR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.refresh()}
                                        className={cn(
                                            buttonVariants({ variant: "outline", size: "sm" }),
                                            "h-11 px-5 text-xs uppercase tracking-normal border-2"
                                        )}
                                    >
                                        Обновить страницу
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        {!session && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={startLinking}
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "lg" }),
                                    "h-14 rounded-3xl px-8 uppercase tracking-widest text-sm font-bold disabled:opacity-60"
                                )}
                            >
                                {isPending ? "Создаём запрос..." : "Привязать Telegram"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Modal
                open={Boolean(session && showQrModal)}
                title="Продолжить по QR"
                onClose={() => setShowQrModal(false)}
                size="sm"
            >
                <div className="space-y-5">
                    <div className="text-sm leading-relaxed text-black/70">
                        Отсканируй QR-код телефоном. Он откроет Telegram сразу на шаге привязки, даже если на этом компьютере Telegram не установлен.
                    </div>

                    <div className="flex justify-center">
                        <div className="rounded-[28px] border-2 border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="QR-код для продолжения привязки в Telegram"
                                    className="h-[260px] w-[260px] rounded-[20px]"
                                />
                            ) : (
                                <div className="flex h-[260px] w-[260px] items-center justify-center rounded-[20px] bg-black/5 text-sm text-black/50">
                                    QR-код пока недоступен
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border-2 border-black/10 bg-black/[0.03] p-4 text-sm text-black/65">
                        Если удобнее, можно просто открыть ссылку в Telegram на этом устройстве.
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {session && (
                            <Link
                                href={session.deepLink}
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "sm" }),
                                    "h-11 px-5 text-xs uppercase tracking-normal"
                                )}
                            >
                                Открыть Telegram
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowQrModal(false)}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-5 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
