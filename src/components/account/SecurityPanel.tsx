"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { maskEmailAddress, type BackendAccountPortal, type BackendIdentity } from "@/lib/backend";
import { buttonVariants } from "@/components/ui/Button";
import { Modal } from "@/components/account/Modal";
import { TelegramLinkCard } from "@/components/account/TelegramLinkCard";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";

interface SecurityPanelProps {
    state?: ModuleState;
    emailIdentity?: BackendIdentity | null;
    telegramExternalId?: string | null;
    telegramUsername?: string | null;
    portal?: BackendAccountPortal;
}

interface Email2FARequestPayload {
    challenge_token?: string;
    masked_email?: string | null;
    expires_at?: string | null;
    detail?: string;
}

function translateSecurityError(detail: string): string {
    switch (detail) {
        case "Unauthorized":
            return "Сессия истекла. Обнови страницу и войди снова.";
        case "email_required":
            return "Сначала добавь email в профиле, чтобы включить двухфакторную защиту.";
        case "email_not_verified":
            return "Для этого email еще не подтвержден. Сначала завершим подтверждение адреса.";
        case "email_2fa_already_enabled":
            return "Двухфакторная защита уже включена.";
        case "email_2fa_not_enabled":
            return "Двухфакторная защита пока не включена.";
        case "email_delivery_failed":
            return "Не получилось отправить письмо с кодом. Попробуй еще раз чуть позже.";
        case "email_code_recently_sent":
            return "Код уже отправлен недавно. Попробуй еще раз примерно через минуту.";
        case "email_code_invalid":
            return "Код неверный. Проверь письмо и попробуй еще раз.";
        case "email_code_expired":
            return "Срок действия кода истек. Запроси новый код.";
        case "email_code_not_found":
        case "email_code_consumed":
            return "Этот код уже неактуален. Запроси новый код.";
        case "email_code_temporarily_blocked":
            return "Слишком много отправок кода за короткое время. Попробуй позже.";
        case "account_deleted":
            return "Этот аккаунт уже удалён.";
        case "email_reuse_blocked":
            return "Этот email временно недоступен для новой регистрации после удаления аккаунта.";
        default:
            return detail;
    }
}

export function SecurityPanel({
    state = "success",
    emailIdentity = null,
    telegramExternalId = null,
    telegramUsername = null,
    portal = "customer",
}: SecurityPanelProps) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePhrase, setDeletePhrase] = useState("");
    const [deleteCode, setDeleteCode] = useState("");
    const [deleteToken, setDeleteToken] = useState<string | null>(null);
    const [deleteMaskedEmail, setDeleteMaskedEmail] = useState<string | null>(null);
    const [deleteExpiresAt, setDeleteExpiresAt] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [email2faCode, setEmail2faCode] = useState("");
    const [email2faToken, setEmail2faToken] = useState<string | null>(null);
    const [email2faMaskedEmail, setEmail2faMaskedEmail] = useState<string | null>(maskEmailAddress(emailIdentity?.email));
    const [email2faExpiresAt, setEmail2faExpiresAt] = useState<string | null>(null);
    const [email2faEnabledOverride, setEmail2faEnabledOverride] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();
    const email2faEnabled = email2faEnabledOverride ?? Boolean(emailIdentity?.email_2fa_enabled);
    const hasEmailIdentity = Boolean(emailIdentity?.email);
    const maskedIdentityEmail = maskEmailAddress(emailIdentity?.email);

    useEffect(() => {
        setEmail2faEnabledOverride(null);
        if (emailIdentity?.email_2fa_enabled) {
            setEmail2faToken(null);
            setEmail2faCode("");
            setEmail2faExpiresAt(null);
            setEmail2faMaskedEmail(maskedIdentityEmail);
        } else if (!email2faToken) {
            setEmail2faMaskedEmail(maskedIdentityEmail);
        }
    }, [email2faToken, emailIdentity?.email, emailIdentity?.email_2fa_enabled, maskedIdentityEmail]);

    function requestEnableEmail2FA() {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/account/security/2fa/email/request", {
                        method: "POST",
                    });
                    const payload = (await response.json().catch(() => ({}))) as Email2FARequestPayload;
                    if (!response.ok) {
                        throw new Error(translateSecurityError(payload.detail ?? "Не удалось отправить код"));
                    }

                    setEmail2faToken(payload.challenge_token ?? null);
                    setEmail2faMaskedEmail(payload.masked_email ?? maskedIdentityEmail);
                    setEmail2faExpiresAt(payload.expires_at ?? null);
                    setEmail2faCode("");
                    setMessage(`Код для включения 2FA отправили на ${payload.masked_email ?? maskedIdentityEmail}.`);
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось отправить код"
                    );
                }
            })();
        });
    }

    function confirmEnableEmail2FA() {
        if (!email2faToken) {
            setError("Сначала запроси код для включения 2FA.");
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/account/security/2fa/email/confirm", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            token: email2faToken,
                            code: email2faCode,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(translateSecurityError(payload.detail ?? "Не удалось включить 2FA"));
                    }

                    setEmail2faEnabledOverride(true);
                    setEmail2faToken(null);
                    setEmail2faCode("");
                    setEmail2faExpiresAt(null);
                    setMessage("Двухфакторная защита включена. Теперь при входе сайт будет просить код из письма.");
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось включить 2FA"
                    );
                }
            })();
        });
    }

    function disableEmail2FA() {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/account/security/2fa/email", {
                        method: "DELETE",
                    });
                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(translateSecurityError(payload.detail ?? "Не удалось отключить 2FA"));
                    }

                    setEmail2faEnabledOverride(false);
                    setEmail2faToken(null);
                    setEmail2faCode("");
                    setEmail2faExpiresAt(null);
                    setEmail2faMaskedEmail(maskedIdentityEmail);
                    setMessage("Двухфакторная защита отключена.");
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось отключить 2FA"
                    );
                }
            })();
        });
    }

    function submitDeleteAccount() {
        if (!deleteToken) {
            setError("Сначала отправь код подтверждения на email.");
            return;
        }

        if (deletePhrase.trim().toUpperCase() !== "DELETE") {
            setError("Для удаления введи слово DELETE.");
            return;
        }

        if (deleteCode.trim().length < 6) {
            setError("Введи код из письма, чтобы подтвердить удаление аккаунта.");
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/account/delete/confirm", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            token: deleteToken,
                            code: deleteCode,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(translateSecurityError(payload.detail ?? "Не удалось удалить аккаунт"));
                    }

                    setShowDeleteModal(false);
                    router.push("/login");
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось удалить аккаунт"
                    );
                }
            })();
        });
    }

    function requestDeleteCode() {
        if (deletePhrase.trim().toUpperCase() !== "DELETE") {
            setError("Сначала введи слово DELETE, затем запроси код.");
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/account/delete/request", {
                        method: "POST",
                    });
                    const payload = (await response.json().catch(() => ({}))) as Email2FARequestPayload;
                    if (!response.ok) {
                        throw new Error(translateSecurityError(payload.detail ?? "Не удалось отправить код"));
                    }

                    setDeleteToken(payload.challenge_token ?? null);
                    setDeleteMaskedEmail(payload.masked_email ?? null);
                    setDeleteExpiresAt(payload.expires_at ?? null);
                    setDeleteCode("");
                    setMessage(`Код подтверждения отправили на ${payload.masked_email ?? "твою почту"}.`);
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось отправить код"
                    );
                }
            })();
        });
    }

    function resetDeleteModal() {
        setShowDeleteModal(false);
        setDeletePhrase("");
        setDeleteCode("");
        setDeleteToken(null);
        setDeleteMaskedEmail(null);
        setDeleteExpiresAt(null);
    }

    const showMainContent = state !== "loading" && state !== "error";

    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Безопасность</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">2FA, сессии, контроль доступа</p>
                </div>

                {message && (
                    <div className="rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка безопасности…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Ошибка безопасности</div>
                        <p className="mt-2 text-lg">Не удалось загрузить настройки.</p>
                    </div>
                )}

                {showMainContent && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div id="2fa" className="rounded-3xl border-2 border-white/10 p-5">
                            <div className="text-sm font-medium tracking-normal text-white/50">Двухфакторная защита</div>
                            {!hasEmailIdentity ? (
                                <div className="mt-4 rounded-2xl border-2 border-white/10 bg-white/5 p-4 text-sm text-white/60">
                                    Добавь email в профиле, чтобы включить вход с кодом из письма.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-3 flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-lg font-bold">
                                                {email2faEnabled ? "2FA включена" : "Защити вход кодом из письма"}
                                            </div>
                                            <p className="text-sm text-white/60">
                                                {email2faEnabled
                                                    ? `Код входа приходит на ${email2faMaskedEmail ?? maskedIdentityEmail}.`
                                                    : `После включения код будет приходить на ${maskedIdentityEmail}.`}
                                            </p>
                                        </div>
                                        {email2faEnabled ? (
                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={disableEmail2FA}
                                                className="h-9 rounded-full border-2 border-white/20 px-3 text-xs font-bold uppercase tracking-normal disabled:opacity-60"
                                            >
                                                Отключить
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={requestEnableEmail2FA}
                                                className="h-9 rounded-full border-2 border-brand/40 bg-brand/10 px-3 text-xs font-bold uppercase tracking-normal text-white disabled:opacity-60"
                                            >
                                                Включить 2FA
                                            </button>
                                        )}
                                    </div>

                                    {!email2faEnabled && email2faToken && (
                                        <div className="mt-4 space-y-3 rounded-2xl border-2 border-white/10 bg-white/5 p-4">
                                            <div className="text-sm text-white/70">
                                                Введи код из письма на <span className="font-semibold text-white">{email2faMaskedEmail ?? maskedIdentityEmail}</span>.
                                            </div>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                value={email2faCode}
                                                onChange={(event) => setEmail2faCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                                placeholder="Код из письма"
                                                className="h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold tracking-[0.3em]"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    disabled={isPending || email2faCode.trim().length < 6}
                                                    onClick={confirmEnableEmail2FA}
                                                    className={cn(
                                                        buttonVariants({ variant: "brand", size: "sm" }),
                                                        "h-11 px-5 text-xs uppercase tracking-normal disabled:opacity-60"
                                                    )}
                                                >
                                                    Подтвердить код
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={requestEnableEmail2FA}
                                                    className={cn(
                                                        buttonVariants({ variant: "outline", size: "sm" }),
                                                        "h-11 px-5 text-xs uppercase tracking-normal border-2 disabled:opacity-60"
                                                    )}
                                                >
                                                    Отправить еще раз
                                                </button>
                                            </div>
                                            {email2faExpiresAt && (
                                                <div className="text-xs uppercase tracking-normal text-white/45">
                                                    Код уже отправлен и действует ограниченное время.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </>
                            )}
                        </div>

                        <TelegramLinkCard
                            telegramExternalId={telegramExternalId}
                            telegramUsername={telegramUsername}
                            portal={portal}
                        />

                        <div className="rounded-3xl border-2 border-white/10 p-5 lg:col-span-2">
                            <div className="text-sm font-medium tracking-normal text-white/50">Помощь и статус</div>
                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                                <Link href="/download/windows" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold transition hover:bg-white/5">Инструкция Windows</Link>
                                <Link href="/download/ios" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold transition hover:bg-white/5">Инструкция iOS</Link>
                                <Link href="/download/android" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold transition hover:bg-white/5">Инструкция Android</Link>
                                <Link href="/help#contact" className="block rounded-2xl border-2 border-white/10 px-4 py-3 font-semibold transition hover:bg-white/5">Написать в поддержку</Link>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/5 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-sm font-medium tracking-normal text-red-400">Опасная зона</div>
                            <div className="mt-2 text-lg font-semibold text-white">Удаление аккаунта</div>
                            <p className="text-sm text-white/60">Удаление аккаунта приведёт к потере доступа к данным, устройствам и истории оплат.</p>
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
                onClose={() => !isPending && resetDeleteModal()}
                title="Удалить аккаунт"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={requestDeleteCode}
                            disabled={isPending || deletePhrase.trim().toUpperCase() !== "DELETE"}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2 !text-black hover:!text-black active:!text-black disabled:!text-black/35"
                            )}
                        >
                            {isPending && !deleteToken ? "Отправляем..." : "Получить код"}
                        </button>
                        <button
                            type="button"
                            onClick={submitDeleteAccount}
                            disabled={isPending || deletePhrase.trim().toUpperCase() !== "DELETE" || deleteCode.trim().length < 6 || !deleteToken}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal !text-black hover:!text-black active:!text-black disabled:!text-black/35"
                            )}
                        >
                            {isPending ? "Удаляем..." : "Подтвердить удаление"}
                        </button>
                        <button
                            type="button"
                            onClick={resetDeleteModal}
                            disabled={isPending}
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
                        Это действие необратимо. Для подтверждения введи слово <span className="font-bold">DELETE</span>.
                    </p>
                    <input
                        type="text"
                        value={deletePhrase}
                        onChange={(event) => {
                            setDeletePhrase(event.target.value);
                            setError(null);
                        }}
                        placeholder="DELETE"
                        className="h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold"
                    />
                    {deleteToken && (
                        <>
                            <div className="rounded-2xl border-2 border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                                Код отправили на <span className="font-bold text-black">{deleteMaskedEmail ?? "твою почту"}</span>.
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={deleteCode}
                                onChange={(event) => {
                                    setDeleteCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                                    setError(null);
                                }}
                                placeholder="Код из письма"
                                className="h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold tracking-[0.3em]"
                            />
                            {deleteExpiresAt && (
                                <div className="text-xs uppercase tracking-normal text-black/45">
                                    Код действует ограниченное время.
                                </div>
                            )}
                        </>
                    )}
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-400">
                        Перед удалением убедись, что сохранил нужные данные и больше не используешь этот аккаунт.
                    </div>
                    {error && showDeleteModal && (
                        <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                </div>
            </Modal>
        </section>
    );
}
