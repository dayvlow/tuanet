"use client";

import { useMemo, useState } from "react";
import { ProfileInfo } from "@/lib/account-fixtures";
import { ModuleState } from "@/components/account/KeysTable";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
    profile: ProfileInfo;
    state?: ModuleState;
}

export function ProfileForm({ profile, state = "success" }: ProfileFormProps) {
    const [name, setName] = useState(profile.name);
    const [birthDate, setBirthDate] = useState(profile.birthDate);
    const [email, setEmail] = useState(profile.email);
    const [saveNotice, setSaveNotice] = useState("");
    const [emailNotice, setEmailNotice] = useState("");

    function resetForm() {
        setName(profile.name);
        setBirthDate(profile.birthDate);
        setEmail(profile.email);
        setSaveNotice("");
    }

    return (
        <section className="h-full rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Профиль</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Основные данные аккаунта.</p>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загружаем профиль…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-400">Не удалось загрузить профиль</div>
                        <p className="mt-2 text-lg">Попробуй обновить страницу чуть позже.</p>
                    </div>
                )}

                {state === "success" && (
                    <div className="grid gap-5">
                        {saveNotice && (
                            <div className="rounded-2xl border-2 border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                {saveNotice}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Дата рождения</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(event) => setBirthDate(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            {!profile.emailVerified && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-normal text-red-400">
                                    Email не подтвержден
                                    <button
                                        type="button"
                                        onClick={() => setEmailNotice("Письмо с подтверждением уже отправлено на этот адрес.")}
                                        className="h-8 rounded-full border-2 border-white/20 px-3 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                    >
                                        Отправить письмо
                                    </button>
                                </div>
                            )}
                            {emailNotice && <div className="mt-2 text-xs uppercase tracking-normal text-white/50">{emailNotice}</div>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setSaveNotice("Изменения сохранены.")}
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Сохранить
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Отменить
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

interface PasswordChangeFormProps {
    state?: ModuleState;
}

export function PasswordChangeForm({ state = "success" }: PasswordChangeFormProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notice, setNotice] = useState("");

    const strength = useMemo(() => {
        if (newPassword.length >= 12) return { width: "w-full", label: "Пароль: высокий уровень" };
        if (newPassword.length >= 8) return { width: "w-2/3", label: "Пароль: хороший уровень" };
        if (newPassword.length >= 4) return { width: "w-1/3", label: "Пароль: средний уровень" };
        return { width: "w-0", label: "Пароль: слабый" };
    }, [newPassword]);

    const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

    function handleUpdatePassword() {
        if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
            setNotice("Проверь текущий пароль и убедись, что новый пароль совпадает с подтверждением.");
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNotice("Пароль обновлен. В следующий раз входи уже с новым паролем.");
    }

    return (
        <section className="h-full rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Смена пароля</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Обнови пароль, если хочешь усилить защиту аккаунта.</p>
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
                        <div className="text-base font-medium leading-relaxed text-red-400">Не удалось обновить пароль</div>
                        <p className="mt-2 text-lg">Проверь текущий пароль и попробуй еще раз.</p>
                    </div>
                )}

                {state === "success" && (
                    <div className="grid gap-5">
                        {notice && (
                            <div className="rounded-2xl border-2 border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                {notice}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Текущий пароль</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                placeholder="••••••••"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Новый пароль</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="Минимум 8 символов"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                                <div className={cn("h-2 rounded-full bg-brand transition-all", strength.width)} />
                            </div>
                            <div className="mt-2 text-xs uppercase tracking-normal text-white/50">{strength.label}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Подтверждение</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Повтори пароль"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            {!passwordsMatch && <div className="mt-2 text-xs uppercase tracking-normal text-red-400">Пароли должны совпадать</div>}
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdatePassword}
                            className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Обновить пароль
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
