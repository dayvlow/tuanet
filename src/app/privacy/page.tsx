"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const collectedData = [
    "адрес электронной почты;",
    "Telegram ID (при использовании Telegram-бота);",
    "технические данные подключения;",
    "информация о платежах (без хранения данных банковских карт);",
    "иные данные, необходимые для предоставления услуг.",
];

const userRights = [
    "запросить информацию о ваших данных;",
    "изменить или удалить данные;",
    "ограничить обработку данных.",
];

const technicalData = [
    "IP-адрес;",
    "время посещения;",
    "тип браузера и операционной системы;",
    "данные о действиях на сайте.",
];

const cookieUsage = [
    "обеспечения корректной работы сайта;",
    "авторизации пользователей;",
    "сохранения пользовательских настроек.",
];

const thirdPartyCases = [
    "случаев, предусмотренных законодательством;",
    "необходимости предоставления услуги (например, платежные системы).",
];

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3 text-lg leading-relaxed text-black/75">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black pb-20 pt-32 text-white selection:bg-brand selection:text-black">
            <Section className="mx-auto max-w-5xl">
                <Reveal>
                    <h1 className="mb-12 text-5xl font-black uppercase italic tracking-tighter md:text-8xl">
                        Политика <span className="text-white/50">конфиденциальности</span>
                    </h1>
                </Reveal>

                <Card variant="default" padding="lg">
                    <div className="space-y-8 text-black">
                        <div className="space-y-4 text-lg leading-relaxed text-black/80">
                            <p>
                                Администрация сайта tuanet.online (ТУАНЕТ) обязуется сохранять вашу конфиденциальность в сети
                                Интернет. Мы уделяем большое внимание защите предоставляемых вами данных.
                            </p>
                            <p>
                                Мы собираем и обрабатываем персональные данные в следующих целях:
                            </p>
                            <BulletList
                                items={[
                                    "обеспечение работы сервиса «ТУАНЕТ»;",
                                    "предоставление доступа к личному кабинету и функционалу сайта;",
                                    "обработка платежей и учет баланса пользователей;",
                                    "взаимодействие с пользователями (поддержка, уведомления);",
                                    "улучшение качества работы сервиса.",
                                ]}
                            />
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Сбор и использование персональных данных</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Мы придерживаемся принципа минимизации данных и собираем только те данные, которые необходимы для работы сервиса.
                            </p>
                            <p className="text-lg leading-relaxed text-black/75">К таким данным могут относиться:</p>
                            <BulletList items={collectedData} />
                            <p className="text-lg leading-relaxed text-black/75">
                                Мы не запрашиваем и не обрабатываем избыточные персональные данные.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Хранение данных, изменение и удаление</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Пользовательские данные хранятся только в течение времени, необходимого для выполнения целей обработки.
                            </p>
                            <p className="text-lg leading-relaxed text-black/75">Вы имеете право:</p>
                            <BulletList items={userRights} />
                            <p className="text-lg leading-relaxed text-black/75">
                                Для этого вы можете обратиться через контакты, указанные на сайте.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Использование технических данных</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                При посещении сайта tuanet.online автоматически собираются технические данные, включая:
                            </p>
                            <BulletList items={technicalData} />
                            <p className="text-lg leading-relaxed text-black/75">
                                Эти данные используются исключительно для обеспечения работы сервиса, аналитики и безопасности,
                                и не позволяют напрямую идентифицировать пользователя.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Платежи</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Оплата услуг осуществляется через сторонние платежные системы (например, ЮKassa). Мы не храним
                                данные банковских карт пользователей.
                            </p>
                            <p className="text-lg leading-relaxed text-black/75">
                                Все платежные данные обрабатываются непосредственно платежным провайдером в соответствии с его
                                политикой конфиденциальности.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Использование cookies</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Сайт ТУАНЕТ использует cookie-файлы для:
                            </p>
                            <BulletList items={cookieUsage} />
                            <p className="text-lg leading-relaxed text-black/75">
                                Вы можете настроить использование cookie в своем браузере. Отключение cookie может повлиять на работоспособность сайта.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Использование сторонних сервисов</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                На сайте могут использоваться сторонние сервисы (аналитика, защита от атак, платежи), которые могут собирать обезличенные данные.
                            </p>
                            <p className="text-lg leading-relaxed text-black/75">
                                Мы не передаем персональные данные третьим лицам, за исключением:
                            </p>
                            <BulletList items={thirdPartyCases} />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Безопасность данных</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Мы принимаем необходимые организационные и технические меры для защиты данных пользователей
                                от несанкционированного доступа, изменения, раскрытия или уничтожения.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Ссылки на сторонние сайты</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Сайт может содержать ссылки на сторонние ресурсы. Мы не несем ответственности за их содержание
                                и политику конфиденциальности.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Изменения политики конфиденциальности</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Администрация сайта ТУАНЕТ оставляет за собой право вносить изменения в настоящую политику.
                                Актуальная версия всегда доступна на данной странице.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Обратная связь</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                По всем вопросам, связанным с политикой конфиденциальности, вы можете связаться с нами через
                                контактные данные, указанные на сайте tuanet.online
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Заключительные положения</h2>
                            <p className="text-lg leading-relaxed text-black/75">
                                Используя сайт ТУАНЕТ, вы соглашаетесь с данной политикой конфиденциальности. Если вы не
                                согласны с условиями, пожалуйста, прекратите использование сайта.
                            </p>
                        </section>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
