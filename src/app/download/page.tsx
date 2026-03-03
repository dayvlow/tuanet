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
                            Выбери платформу, установи приложение и войди в аккаунт.
                            Дальше подключение идет внутри приложения.
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
                    {[
                        {
                            platform: "Windows",
                            desc: "Работает на актуальных версиях Windows.",
                            link: "/download/windows",
                        },
                        {
                            platform: "iOS",
                            desc: "Установка как у обычного приложения.",
                            link: "/download/ios",
                        },
                        {
                            platform: "Android",
                            desc: "Запускается без ручной возни с настройками.",
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
                                    Скачать и установить
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="solid" className="p-8 border-white/10">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Уже оплатил?</h3>
                        <p className="text-lg text-white/60 mb-6">Войди в аккаунт и установи приложение под свою платформу.</p>
                        <Link
                            href="/account"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "h-14 px-8 rounded-3xl uppercase tracking-widest text-sm font-bold"
                            )}
                        >
                            Войти в аккаунт
                        </Link>
                    </Card>
                    <Card variant="outline" className="p-8 border-white/15">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Нет подписки?</h3>
                        <p className="text-lg text-white/60 mb-6">Сначала выбери срок и оплати, потом вернись к установке.</p>
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
