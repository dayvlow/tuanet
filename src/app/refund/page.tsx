"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

export default function RefundPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto">
                <Reveal>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 uppercase italic">Возвраты</h1>
                </Reveal>

                <Card variant="default" padding="lg">
                    <div className="space-y-8 text-lg text-black/70">
                        <p className="text-black/80">
                            Мы хотим, чтобы решение было осознанным. Если сервис не подошёл — возврат возможен.
                        </p>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Основные правила</h2>
                            <ul className="space-y-3">
                                {[
                                    "Возврат доступен в течение 7 дней при первом платеже",
                                    "Возврат оформляется через поддержку с указанием email аккаунта",
                                    "Доступ отключается после подтверждения возврата",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Когда возврат невозможен</h2>
                            <ul className="space-y-3">
                                {[
                                    "Прошло более 7 дней с момента оплаты",
                                    "Аккаунт активно использовался и зафиксировано подключение",
                                    "Возврат уже был сделан ранее",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t border-black/10 pt-6">
                            <p>
                                По вопросам возврата напиши в поддержку на <Link href="/help#contact" className="text-black hover:text-brand transition-colors">странице помощи</Link>.
                            </p>
                        </div>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
