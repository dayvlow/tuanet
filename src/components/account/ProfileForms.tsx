"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

import { ProfileInfo } from "@/lib/account-fixtures";
import type { BackendAccountPortal } from "@/lib/backend";
import { appendPortalQuery } from "@/lib/session-portal";
import { ModuleState } from "@/components/account/KeysTable";

interface ProfileFormProps {
    profile: ProfileInfo;
    state?: ModuleState;
    portal?: BackendAccountPortal;
    accountId?: number;
}

function formatBirthDateForDisplay(value: string): string {
    if (!value) {
        return "";
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) {
        return value;
    }

    return `${match[3]}.${match[2]}.${match[1]}`;
}

function normalizeBirthDateForSubmit(value: string): string {
    const normalized = value.trim();
    if (!normalized) {
        return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return normalized;
    }

    const dottedMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(normalized);
    if (dottedMatch) {
        return `${dottedMatch[3]}-${dottedMatch[2]}-${dottedMatch[1]}`;
    }

    throw new Error("Дата рождения должна быть в формате ДД.ММ.ГГГГ или YYYY-MM-DD");
}

export function ProfileForm({ profile, state = "success", portal, accountId }: ProfileFormProps) {
    const router = useRouter();
    const [name, setName] = useState(profile.name);
    const [birthDate, setBirthDate] = useState(formatBirthDateForDisplay(profile.birthDate));
    const [email, setEmail] = useState(profile.email);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedAccountId, setCopiedAccountId] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setName(profile.name);
        setBirthDate(formatBirthDateForDisplay(profile.birthDate));
        setEmail(profile.email);
    }, [profile.birthDate, profile.email, profile.name]);

    function translateProfileError(detail: string): string {
        switch (detail) {
            case "email_reuse_blocked":
                return "Этот email временно нельзя использовать после удаления предыдущего аккаунта.";
            default:
                return detail;
        }
    }

    function submitProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const normalizedBirthDate = normalizeBirthDateForSubmit(birthDate);

                    const response = await fetch(appendPortalQuery("/api/account/profile", portal), {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            display_name: name,
                            birth_date: normalizedBirthDate,
                            email,
                        }),
                    });

                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(translateProfileError(payload.detail ?? "Не удалось сохранить профиль"));
                    }

                    setMessage("Профиль сохранён. Обновляю данные аккаунта…");
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось сохранить профиль"
                    );
                }
            })();
        });
    }

    function handleCopyAccountId() {
        if (!accountId) {
            return;
        }

        void navigator.clipboard.writeText(String(accountId)).then(() => {
            setCopiedAccountId(true);
            window.setTimeout(() => setCopiedAccountId(false), 1800);
        }).catch(() => {
            setError("Не удалось скопировать ID аккаунта");
        });
    }

    return (
        <section className="h-full rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Профиль</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Данные аккаунта</p>
                </div>

                {accountId ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-white/10 bg-black/20 p-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-normal text-white/40">ID аккаунта</div>
                            <div className="mt-1 text-lg font-black tracking-tight text-white">#{accountId}</div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyAccountId}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-normal text-white transition hover:bg-white/6"
                        >
                            <Copy className="h-4 w-4" strokeWidth={2.4} />
                            {copiedAccountId ? "Скопировано" : "Скопировать ID"}
                        </button>
                    </div>
                ) : null}

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка профиля…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Ошибка профиля</div>
                        <p className="mt-2 text-lg">Не удалось загрузить данные.</p>
                    </div>
                )}

                {state === "success" && (
                    <form className="grid gap-5" onSubmit={submitProfile}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Дата рождения</label>
                            <input
                                type="text"
                                value={birthDate}
                                onChange={(event) => setBirthDate(event.target.value)}
                                placeholder="ДД.ММ.ГГГГ"
                                inputMode="numeric"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold"
                            />
                            <div className="mt-2 text-xs text-white/45">Можно указать как `ДД.ММ.ГГГГ`, так и `YYYY-MM-DD`.</div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold"
                            />
                            {!profile.emailVerified && email && (
                                <div className="mt-3 rounded-2xl border-2 border-white/10 bg-white/5 p-3 text-xs uppercase tracking-normal text-white/55">
                                    Подтверждение email подключим следующим этапом после переноса почтового сервиса.
                                </div>
                            )}
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

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                {isPending ? "Сохраняем..." : "Сохранить"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setName(profile.name);
                                    setBirthDate(formatBirthDateForDisplay(profile.birthDate));
                                    setEmail(profile.email);
                                    setMessage(null);
                                    setError(null);
                                }}
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Отменить
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}

interface PasswordChangeFormProps {
    state?: ModuleState;
    hasEmail?: boolean;
    hasPassword?: boolean;
    portal?: BackendAccountPortal;
}

export function PasswordChangeForm({
    state = "success",
    hasEmail = false,
    hasPassword = false,
    portal,
}: PasswordChangeFormProps) {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

    function submitPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!hasEmail) {
            setError("Сначала добавь email в профиль, чтобы включить вход по паролю.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Пароль должен быть не короче 6 символов.");
            return;
        }

        if (!passwordsMatch) {
            setError("Пароли должны совпадать.");
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch(appendPortalQuery("/api/account/password", portal), {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            current_password: currentPassword,
                            new_password: newPassword,
                        }),
                    });

                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось обновить пароль");
                    }

                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setMessage(hasPassword ? "Пароль обновлён." : "Пароль задан. Теперь email можно использовать для входа.");
                    router.refresh();
                } catch (requestError) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Не удалось обновить пароль"
                    );
                }
            })();
        });
    }

    return (
        <section className="h-full rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Смена пароля</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Сильный пароль = безопасный аккаунт</p>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Проверяем данные…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Ошибка пароля</div>
                        <p className="mt-2 text-lg">Не удалось загрузить настройки входа.</p>
                    </div>
                )}

                {state === "success" && (
                    <form className="grid gap-5" onSubmit={submitPassword}>
                        {!hasEmail && (
                            <div className="rounded-3xl border-2 border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                Сначала укажи email в профиле. После этого здесь можно будет задать пароль для входа на сайт.
                            </div>
                        )}

                        {hasEmail && !hasPassword && (
                            <div className="rounded-3xl border-2 border-brand/30 bg-brand/10 p-4 text-sm text-white/80">
                                Это первая установка пароля: текущее значение можно не вводить.
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Текущий пароль</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                placeholder={hasPassword ? "••••••••" : "Не требуется для первой установки"}
                                disabled={!hasEmail}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Новый пароль</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="Минимум 6 символов"
                                disabled={!hasEmail}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold disabled:opacity-60"
                            />
                            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                                <div
                                    className="h-2 rounded-full bg-brand transition-all"
                                    style={{ width: `${Math.min(100, Math.max(12, newPassword.length * 12))}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs uppercase tracking-normal text-white/50">
                                Надежность: {newPassword.length >= 10 ? "сильный" : newPassword.length >= 6 ? "нормальный" : "низкий"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Подтверждение</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Повтори пароль"
                                disabled={!hasEmail}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 bg-black/20 px-4 text-sm font-semibold disabled:opacity-60"
                            />
                            {!passwordsMatch && (
                                <div className="mt-2 text-xs uppercase tracking-normal text-red-400">Пароли должны совпадать</div>
                            )}
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

                        <button
                            type="submit"
                            disabled={isPending || !hasEmail}
                            className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            {isPending ? "Обновляем..." : hasPassword ? "Обновить пароль" : "Задать пароль"}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
