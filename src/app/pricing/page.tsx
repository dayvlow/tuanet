"use client";

import { buttonVariants } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Pricing() {
    const sectionSpacing = "py-16 md:py-24";

    const plans = [
        {
            id: "week",
            name: "Неделя",
            price: "199 ₽",
            period: "7 дней",
            desc: "Если хочешь посмотреть, как сервис работает на практике.",
            devices: "До 5 устройств",
            features: ["Управление устройствами", "Управление подпиской", "Доступ к приложениям", "Поддержка и база знаний"],
        },
        {
            id: "month",
            name: "Месяц",
            price: "499 ₽",
            period: "30 дней",
            desc: "Для регулярного использования без длинного периода.",
            devices: "До 5 устройств",
            features: ["Управление устройствами", "Управление подпиской", "Доступ к приложениям", "Поддержка и база знаний"],
            popular: true,
        },
        {
            id: "year",
            name: "Год",
            price: "3 990 ₽",
            period: "365 дней",
            desc: "Один платеж на год без ежемесячной ручной оплаты.",
            devices: "До 5 устройств",
            features: ["Управление устройствами", "Управление подпиской", "Доступ к приложениям", "Поддержка и база знаний", "Приоритетная поддержка"],
            highlight: true,
        },
    ];

    return (
        <div className="bg-black text-white pb-20 selection:bg-brand selection:text-black">
            <Section
                container={false}
                padding="none"
                className={`${sectionSpacing} flex flex-col items-center justify-center text-center px-6 md:px-12`}
                style={{ minHeight: 'calc(50vh - var(--nav-height, 0px))' }}
            >
                <Reveal>
                    <div className="flex flex-col gap-8">
                        <h1 className="text-7xl md:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase italic">
                            Тарифы
                        </h1>
                        <p className="max-w-2xl text-2xl text-white/60 font-medium leading-relaxed mx-auto">
                            Функции в каждом тарифе одинаковые. Отличается только срок и стоимость.
                        </p>
                    </div>
                </Reveal>
            </Section>

            <Section padding="none" className={sectionSpacing}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            variant={plan.highlight ? "default" : "outline"}
                            className={`flex flex-col text-left p-10 min-h-[600px] justify-between group hover:scale-105 transition-transform duration-300 ${plan.highlight ? 'bg-white text-black' : 'bg-black border-white/20 text-white'}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
                                        <p className={`text-lg font-medium ${plan.highlight ? 'text-zinc-500' : 'text-zinc-500'}`}>{plan.desc}</p>
                                    </div>
                                    {plan.highlight && (
                                        <span className="bg-brand text-black text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                            Выгоднее
                                        </span>
                                    )}
                                </div>
                                <div className="mb-8">
                                    <div className="text-5xl font-black uppercase tracking-tight">{plan.price}</div>
                                    <div className={`text-sm uppercase tracking-[0.2em] ${plan.highlight ? 'text-zinc-500' : 'text-white/50'}`}>
                                        за {plan.period}
                                    </div>
                                </div>
                                <div className={`text-sm font-bold uppercase tracking-[0.2em] ${plan.highlight ? 'text-zinc-500' : 'text-white/50'} mb-6`}>
                                    {plan.devices}
                                </div>
                                <ul className="space-y-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-4 text-lg font-bold">
                                            <span className={`w-1.5 h-1.5 rounded-full ${plan.highlight ? 'bg-brand' : 'bg-white'}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={`/checkout?plan=${plan.id}`}
                                className={cn(
                                    buttonVariants({ variant: plan.highlight ? "brand" : "outline", size: "lg" }),
                                    `mt-12 w-full h-16 text-lg rounded-3xl uppercase tracking-widest ${plan.highlight ? 'shadow-xl' : 'border-white/20 hover:bg-white/10'}`
                                )}
                            >
                                Выбрать {plan.name}
                            </Link>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section padding="none" className={sectionSpacing}>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            title: "Что происходит после оплаты",
                            items: [
                                "Сразу открывается доступ к аккаунту и приложению",
                                "Лимит устройств и срок видно в кабинете",
                                "Можно скачать приложение для любой платформы",
                            ],
                        },
                        {
                            title: "Условия и отмена",
                            items: [
                                "Автопродление можно выключить в любой момент",
                                "Отмена не отключает доступ до конца оплаченного периода",
                                "Возврат доступен в течение 7 дней при первом платеже",
                            ],
                        },
                    ].map((block, i) => (
                        <Card key={i} variant="solid" className="p-8 border-white/10">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{block.title}</h3>
                            <ul className="space-y-3 text-lg text-white/70">
                                {block.items.map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section padding="none" className={sectionSpacing}>
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">Нужна помощь с выбором?</h2>
                    <p className="text-xl text-white/60 mb-10">
                        Если сомневаешься, напиши в поддержку. Поможем выбрать по твоему сценарию.
                    </p>
                    <Link
                        href="/help"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "h-16 px-12 rounded-3xl uppercase tracking-widest text-lg font-bold border-2"
                        )}
                    >
                        Перейти в помощь
                    </Link>
                </div>
            </Section>
        </div>
    );
}
