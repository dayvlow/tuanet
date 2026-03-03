"use client";

import { ProfileInfo } from "@/lib/account-fixtures";
import { ModuleState } from "@/components/account/KeysTable";

interface ProfileFormProps {
    profile: ProfileInfo;
    state?: ModuleState;
}

export function ProfileForm({ profile, state = "success" }: ProfileFormProps) {
    return (
        <section className="h-full rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Профиль</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Данные аккаунта</p>
                </div>

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
                    <div className="grid gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Имя</label>
                            <input
                                type="text"
                                defaultValue={profile.name}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Дата рождения</label>
                            <input
                                type="date"
                                defaultValue={profile.birthDate}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Email</label>
                            <input
                                type="email"
                                defaultValue={profile.email}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            {!profile.emailVerified && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-normal text-red-400">
                                    Email не подтвержден
                                    <button
                                        type="button"
                                        className="h-8 rounded-full border-2 border-white/20 px-3 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                    >
                                        Отправить письмо
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="h-10 rounded-full border-2 border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                Сохранить
                            </button>
                            <button
                                type="button"
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
                        <p className="mt-2 text-lg">Текущий пароль неверный.</p>
                    </div>
                )}

                {state === "success" && (
                    <div className="grid gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Текущий пароль</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Новый пароль</label>
                            <input
                                type="password"
                                placeholder="Минимум 8 символов"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                                <div className="h-2 w-2/3 rounded-full bg-brand" />
                            </div>
                            <div className="mt-2 text-xs uppercase tracking-normal text-white/50">Надежность: сильный</div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-white/50">Подтверждение</label>
                            <input
                                type="password"
                                placeholder="Повтори пароль"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-white/20 px-4 text-sm font-semibold"
                            />
                            <div className="mt-2 text-xs uppercase tracking-normal text-red-400">Пароли должны совпадать</div>
                        </div>
                        <button
                            type="button"
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
