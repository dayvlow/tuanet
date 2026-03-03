"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export default function PrivacyPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto">
                <Reveal>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 uppercase italic">Политика <span className="text-white/50">конфиденциальности</span></h1>
                </Reveal>

                <Card variant="default" padding="lg">
                    <div className="space-y-8">
                        <div>
                            <p className="text-lg font-medium text-black/80">
                                Мы собираем минимум данных, который нужен для работы аккаунта и оплат.
                            </p>
                            <p className="text-lg text-black/70 mt-4">
                                Дата обновления: 22 февраля 2026.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-2xl mb-4">Что мы собираем:</h3>
                            <ul className="space-y-3 text-lg text-black/70">
                                {[
                                    "Email для авторизации",
                                    "Платежные данные через провайдера оплаты",
                                    "Технические события использования (ошибки, версия приложения)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-2xl mb-4">Зачем:</h3>
                            <ul className="space-y-3 text-lg text-black/70">
                                {[
                                    "Авторизация в кабинете",
                                    "Поддержка и техническая помощь",
                                    "Безопасность аккаунта",
                                    "Обработка платежей и биллинг"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-2xl mb-4">Дополнительно:</h3>
                            <ul className="space-y-3 text-lg text-black/70">
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    Хранение и защита данных в защищённых хранилищах
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    Передача платежных данных только платежным провайдерам
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    Права пользователя на доступ и удаление своих данных
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4 text-lg text-black/70">
                            <p>
                                Мы не продаём персональные данные третьим лицам и используем их только для работы сервиса,
                                поддержки и безопасности.
                            </p>
                            <p>
                                Запросы на удаление или экспорт данных можно отправить через поддержку на странице «Помощь».
                            </p>
                        </div>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
