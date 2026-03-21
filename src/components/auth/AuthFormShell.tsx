"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AuthFormShellProps {
    mode: "login" | "register";
}

export function AuthFormShell({ mode }: AuthFormShellProps) {
    const isLogin = mode === "login";
    const [notice, setNotice] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const content = useMemo(() => {
        if (isLogin) {
            return {
                title: "Вход в аккаунт",
                subtitle: "Войдите, чтобы перейти к ключам, устройствам и настройкам доступа.",
                submitLabel: "Войти",
                switchText: "Еще нет аккаунта?",
                switchLabel: "Создать аккаунт",
                switchHref: "/register",
                asideTitle: "Все под рукой",
                asideText: "После входа вы попадаете в кабинет, где можно создавать ключи, управлять устройствами и следить за безопасностью.",
            };
        }

        return {
            title: "Создание аккаунта",
            subtitle: "Зарегистрируйтесь, чтобы управлять подключением, устройствами и доступом в одном кабинете.",
            submitLabel: "Создать аккаунт",
            switchText: "Уже есть аккаунт?",
            switchLabel: "Войти",
            switchHref: "/login",
            asideTitle: "Один аккаунт для всего",
            asideText: "После регистрации можно установить приложение, создать ключ и подключить нужные устройства по понятному сценарию.",
        };
    }, [isLogin]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            setNotice("Проверьте пароль и подтверждение. Они должны совпадать.");
            return;
        }

        setNotice(
            isLogin
                ? "Форма входа готова к подключению бэкенда."
                : "Форма регистрации готова к подключению бэкенда."
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="mx-auto max-w-2xl">
                    <Reveal>
                        <Card
                            variant="solid"
                            padding="lg"
                            className="min-h-[620px] border-white/10 bg-zinc-900/90 text-white"
                        >
                            <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center">
                                <div>
                                    <div className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                                        Туанет
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                                        {content.title}
                                    </h2>
                                    <p className="mt-4 text-lg leading-relaxed text-white/60">
                                        {content.subtitle}
                                    </p>
                                </div>

                                <form className="mt-10 grid gap-5" onSubmit={handleSubmit}>
                                    {!isLogin && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                                                Имя
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Как к вам обращаться"
                                                className="mt-2 h-13 w-full rounded-2xl border-2 border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-brand"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="name@email.com"
                                            className="mt-2 h-13 w-full rounded-2xl border-2 border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-brand"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                                            Пароль
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder={isLogin ? "Введите пароль" : "Минимум 8 символов"}
                                            className="mt-2 h-13 w-full rounded-2xl border-2 border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-brand"
                                        />
                                    </div>

                                    {!isLogin && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                                                Подтверждение
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                placeholder="Повторите пароль"
                                                className="mt-2 h-13 w-full rounded-2xl border-2 border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-brand"
                                            />
                                        </div>
                                    )}

                                    {isLogin ? (
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <label className="flex items-center gap-3 text-white/55">
                                                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
                                                Запомнить меня
                                            </label>
                                            <Link href="/help#contact" className="font-semibold text-white/55 transition hover:text-brand">
                                                Не помню пароль
                                            </Link>
                                        </div>
                                    ) : (
                                        <label className="flex items-start gap-3 text-sm leading-relaxed text-white/55">
                                            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent" />
                                            Я согласен с условиями использования и политикой конфиденциальности.
                                        </label>
                                    )}

                                    {notice && (
                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                                            {notice}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className={cn(
                                            buttonVariants({ variant: "brand", size: "lg" }),
                                            "mt-2 h-14 rounded-3xl text-sm font-black uppercase tracking-[0.18em]"
                                        )}
                                    >
                                        {content.submitLabel}
                                    </button>
                                </form>

                                <div className="mt-8 text-sm text-white/55">
                                    {content.switchText}{" "}
                                    <Link href={content.switchHref} className="font-bold text-white transition hover:text-brand">
                                        {content.switchLabel}
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </Reveal>
                </div>
            </Section>
        </div>
    );
}
