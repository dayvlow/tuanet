"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black pb-20 pt-32 text-white selection:bg-brand selection:text-black">
            <Section className="mx-auto max-w-4xl">
                <Reveal>
                    <h1 className="mb-12 text-6xl font-black uppercase italic tracking-tighter md:text-8xl">
                        О <span className="text-white/50">продукте</span>
                    </h1>
                </Reveal>

                <Card variant="default" padding="lg">
                    <div className="space-y-8 text-lg leading-relaxed text-black/75">
                        <div className="space-y-4">
                            <p>«ТУАНЕТ» — это цифровой сервис для ускорения и оптимизации интернет-соединения.</p>
                            <p>Сервис помогает пользователям:</p>
                            <ul className="space-y-2 pl-6">
                                <li>повысить скорость загрузки сайтов, видео и приложений;</li>
                                <li>улучшить стабильность интернет-соединения;</li>
                                <li>сократить задержки и проблемы при работе отдельных сервисов;</li>
                                <li>получать более быстрый доступ к интернет-ресурсам через собственную серверную инфраструктуру.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <p>
                                После оплаты пользователь получает доступ к программному обеспечению и сетевой инфраструктуре
                                сервиса, возможность подключить одно или несколько устройств, выбрать сервер и управлять
                                подключением через личный кабинет.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p>Оплата взимается за:</p>
                            <ul className="space-y-2 pl-6">
                                <li>подписку на использование сервиса;</li>
                                <li>подключение дополнительных устройств;</li>
                                <li>продление доступа к сервису;</li>
                                <li>расширенные функции и дополнительные серверы.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <p>
                                Сервис не продает физические товары. Все платежи относятся исключительно к предоставлению
                                цифрового доступа к сервису ускорения интернет-соединения.
                            </p>
                        </div>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
