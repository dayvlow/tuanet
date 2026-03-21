"use client";

import { buttonVariants } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Download() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="flex flex-col items-center text-center">
                <Reveal width="100%">
                    <div className="w-full flex flex-col items-center text-center">
                        <h1 className="text-6xl md:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase italic mb-8">
                            Скачать<br/>
                            <span className="text-white">Туанет</span>
                        </h1>
                        <p className="max-w-2xl text-2xl text-white/60 font-medium leading-relaxed mb-20 mx-auto">
                            Выбери свою платформу, установи приложение и перейди в кабинет.
                            Дальше все управление будет под рукой.
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
                    {[
                        {
                            platform: "Windows",
                            desc: "Установщик и короткая инструкция для первого запуска.",
                            link: "/download/windows",
                        },
                        {
                            platform: "iOS",
                            desc: "Понятный сценарий установки и входа на iPhone.",
                            link: "/download/ios",
                        },
                        {
                            platform: "Android",
                            desc: "Установка и запуск без лишней ручной настройки.",
                            link: "/download/android",
                        }
                    ].map((item) => (
                        <Card
                            key={item.platform}
                            variant="solid"
                            padding="lg"
                            className="flex flex-col items-center justify-between min-h-[300px] text-center group hover:scale-105 transition-transform duration-300 bg-zinc-900/70 border-zinc-800 text-white"
                        >
                            <div className="w-full">
                                <h3 className="text-4xl font-black uppercase tracking-tight mb-2">{item.platform}</h3>
                                <p className="text-xl font-medium text-white/60">{item.desc}</p>
                            </div>

                            <div className="w-full mt-12">
                                <Link
                                    href={item.link}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "default" }),
                                        "w-full h-14 rounded-2xl uppercase tracking-widest text-sm font-bold border-white/20 hover:bg-white hover:text-black"
                                    )}
                                >
                                    Открыть инструкцию
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="solid" className="p-8 border-white/10">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Уже есть доступ?</h3>
                        <p className="text-lg text-white/60 mb-6">Открой кабинет, если нужно проверить ключи, устройства или параметры доступа.</p>
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "h-14 px-8 rounded-3xl uppercase tracking-widest text-sm font-bold"
                            )}
                        >
                            Войти в кабинет
                        </Link>
                    </Card>
                    <Card variant="outline" className="p-8 border-white/15">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Что-то не сходится?</h3>
                        <p className="text-lg text-white/60 mb-6">Если установка или вход идут не по плану, помощь уже рядом.</p>
                        <Link
                            href="/help#contact"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "h-14 px-8 rounded-3xl uppercase tracking-widest text-sm font-bold border-2"
                            )}
                        >
                            Написать в поддержку
                        </Link>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
