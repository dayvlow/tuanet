"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { buttonVariants } from "@/components/ui/Button";
import { SupportLink } from "@/components/ui/SupportLink";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HelpPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-5xl mx-auto">
                <Reveal>
                    <h1 className="mb-8 text-[clamp(3.25rem,14vw,8rem)] font-black tracking-tighter uppercase italic leading-[0.9]">Помощь</h1>
                    <p className="max-w-2xl text-lg text-white/60 sm:text-2xl">
                        Быстрые решения для подключения, оплаты и устройств. Если нужно — мы рядом.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        { title: "Не подключается", desc: "Проверь интернет, лимит устройств и статус сервиса." },
                        { title: "Проблема с оплатой", desc: "Убедись, что карта активна и есть средства." },
                        { title: "Смена устройства", desc: "Отключи старое устройство в кабинете и подключи новое." },
                    ].map((item, i) => (
                        <Card key={i} variant="solid" className="p-8 border-white/10">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
                            <p className="text-lg text-white/60">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="default" className="p-8">
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Частые вопросы</h2>
                        <Accordion
                            items={[
                                {
                                    title: "Как быстро активируется доступ?",
                                    content: "Сразу после оплаты. Доступ привязывается к аккаунту и доступен в приложении.",
                                },
                                {
                                    title: "Можно ли отключить автопродление?",
                                    content: "Да, в кабинете в разделе «Подписка». Доступ сохранится до конца оплаченного периода.",
                                },
                                {
                                    title: "Неограниченное количество устройств",
                                    content: "Управление всеми подключениями доступно в разделе «Устройства».",
                                },
                                {
                                    title: "Где скачать приложение?",
                                    content: "На странице «Скачать» или в разделе платформы. Там же инструкции по установке.",
                                },
                            ]}
                        />
                    </Card>

                    <Card variant="outline" className="p-8 border-white/15" id="contact">
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Связаться с поддержкой</h2>
                        <div className="space-y-4 text-lg text-white/70">
                            <p>
                                Почта:{" "}
                                <SupportLink
                                    href="mailto:support@tuaanet.com"
                                    channel="email"
                                    className="text-white transition-colors hover:text-brand"
                                >
                                    support@tuaanet.com
                                </SupportLink>
                            </p>
                            <p>Время ответа: обычно до 2 часов в рабочее время.</p>
                            <p>Чтобы ускорить ответ, укажи email аккаунта и приложи скрин ошибки.</p>
                        </div>
                        <div className="mt-8 flex flex-col gap-4">
                            <SupportLink
                                href="mailto:support@tuaanet.com?subject=%D0%9F%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%20%D0%A2%D1%83%D0%B0%D0%BD%D0%B5%D1%82"
                                channel="email"
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "lg" }),
                                    "h-14 px-8 rounded-3xl uppercase tracking-widest text-sm font-bold"
                                )}
                            >
                                Написать в поддержку
                            </SupportLink>
                        </div>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
