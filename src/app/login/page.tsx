"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto">
                <Reveal>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic">Войти</h1>
                    <p className="text-2xl text-white/60 max-w-2xl">
                        Используй email, который указан при оплате. Доступ откроется сразу.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <Card variant="solid" className="p-8 border-white/10">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Вход в аккаунт</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Пароль</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-white/50">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4" />
                                    Запомнить меня
                                </label>
                                <Link href="/help#contact" className="hover:text-white">Забыли пароль?</Link>
                            </div>
                            <Link
                                href="/account"
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "lg" }),
                                    "w-full h-14 rounded-3xl uppercase tracking-widest text-sm font-bold"
                                )}
                            >
                                Войти
                            </Link>
                        </div>
                    </Card>

                    <Card variant="outline" className="p-8 border-white/15">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Нет подписки?</h2>
                        <p className="text-lg text-white/60 mb-6">
                            Выбери тариф, оплати и вернись — доступ откроется автоматически.
                        </p>
                        <Link
                            href="/pricing"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "h-14 px-8 rounded-3xl uppercase tracking-widest text-sm font-bold border-2"
                            )}
                        >
                            Выбрать тариф
                        </Link>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
