"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export default function TermsPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto">
                <Reveal>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 uppercase italic">Условия <span className="text-white/50">использования</span></h1>
                </Reveal>

                <Card variant="default" padding="lg">
                    <div className="space-y-8">
                        <div>
                            <p className="text-lg font-medium text-black/80 mb-6">
                                Эти условия описывают правила использования сервиса Туанет, приложения и личного кабинета.
                            </p>
                            <p className="text-lg text-black/70">
                                Дата обновления: 22 февраля 2026.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-2xl mb-4">Разделы:</h3>
                            <ul className="space-y-2 text-lg text-black/70">
                                {[
                                    "Термины",
                                    "Регистрация и доступ",
                                    "Подписка и оплата",
                                    "Использование сервиса",
                                    "Ограничения ответственности",
                                    "Поддержка и контакты",
                                    "Изменения условий"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6 text-lg text-black/70">
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Регистрация и доступ</h4>
                                <p>Доступ к сервису предоставляется после оплаты и входа в аккаунт. Ответственность за сохранность доступа лежит на пользователе.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Подписка и оплата</h4>
                                <p>Подписка оформляется на выбранный срок. Автопродление можно отключить в личном кабинете. Отмена не прекращает доступ до конца оплаченного периода.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Использование сервиса</h4>
                                <p>Сервис предоставляется «как есть». Пользователь обязуется использовать продукт в рамках законодательства и не предпринимать действий, нарушающих работу сервиса.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Поддержка</h4>
                                <p>Поддержка доступна через страницу «Помощь». Для ускорения ответа рекомендуется приложить скрин ошибки и описание проблемы.</p>
                            </div>
                        </div>

                        <div className="border-t border-black/10 pt-8 text-black/70">
                            <p className="text-lg">
                                Используя сервис, ты принимаешь эти условия.
                            </p>
                        </div>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
