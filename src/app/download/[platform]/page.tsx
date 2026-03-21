import { buttonVariants } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function PlatformDownloadPage({
    params,
}: {
    params: Promise<{ platform: string }>;
}) {
    const resolvedParams = await params;
    const { platform } = resolvedParams;
    const validPlatforms = ["windows", "ios", "android"];

    if (!validPlatforms.includes(platform)) {
        notFound();
    }

    const platformData: Record<string, { title: string; subtitle: string; version: string; size: string; requirements: string[]; downloadUrl: string; storeLabel?: string; steps: Array<{ title: string; text: string }>; issues: Array<{ q: string; a: string }> }> = {
        windows: {
            title: "Туанет для Windows",
            subtitle: "Запроси актуальный установщик и пройди короткий сценарий запуска для Windows.",
            version: "v2.4.1",
            size: "64 МБ",
            requirements: ["Windows 10/11", "4 ГБ RAM", "100 МБ свободного места"],
            downloadUrl: "/help#contact",
            storeLabel: "Получить установщик",
            steps: [
                { title: "Получи установщик", text: "Открой поддержку и запроси актуальную ссылку." },
                { title: "Установи приложение", text: "Запусти файл и подтверди установку, если система попросит." },
                { title: "Войди в аккаунт", text: "Используй email, который привязан к твоему аккаунту." },
                { title: "Включи подключение", text: "После этого доступ будет готов к работе." }
            ],
            issues: [
                { q: "Не запускается установщик", a: "Проверь права администратора и попробуй снова." },
                { q: "Антивирус мешает установке", a: "Проверь источник файла и при необходимости добавь приложение в исключения." },
                { q: "Нет подключения", a: "Сначала проверь сеть и статус сервиса." }
            ]
        },
        ios: {
            title: "Туанет для iOS",
            subtitle: "Открой приложение на iPhone, войди в аккаунт и включи подключение по короткому сценарию.",
            version: "v2.4.1",
            size: "48 МБ",
            requirements: ["iOS 16+", "Свободное место 100 МБ"],
            downloadUrl: "/help#contact",
            storeLabel: "Получить ссылку для iPhone",
            steps: [
                { title: "Установи приложение", text: "Перейди в App Store и нажми «Загрузить»." },
                { title: "Войди в аккаунт", text: "Используй email, который привязан к аккаунту." },
                { title: "Разреши системные запросы", text: "Если iPhone попросит подтверждение, просто продолжай по шагам." },
                { title: "Включи подключение", text: "После этого сервис будет готов к работе." }
            ],
            issues: [
                { q: "Приложение ведет себя странно", a: "Закрой его полностью и открой снова." },
                { q: "Проверь интернет", a: "Убедись, что сеть стабильна." },
                { q: "Проверь лимит устройств", a: "В кабинете видно, сколько устройств подключено." },
                { q: "Нужна ручная подсказка", a: "Открой раздел «Помощь» и перейди к поддержке." }
            ]
        },
        android: {
            title: "Туанет для Android",
            subtitle: "Установи приложение на Android, войди в аккаунт и включи доступ без лишней возни.",
            version: "v2.4.1",
            size: "52 МБ",
            requirements: ["Android 10+", "Свободное место 120 МБ"],
            downloadUrl: "/help#contact",
            storeLabel: "Получить ссылку для Android",
            steps: [
                { title: "Установи приложение", text: "Открой Google Play и нажми «Установить»." },
                { title: "Войди в аккаунт", text: "Используй email, который привязан к аккаунту." },
                { title: "Включи подключение", text: "После входа сервис будет готов к запуску." },
                { title: "Подтверди доступы", text: "Если Android покажет системные запросы, просто продолжай по шагам." }
            ],
            issues: [
                { q: "Система ограничивает приложение", a: "Отключи для него оптимизацию батареи." },
                { q: "Нет подключения", a: "Сначала проверь сеть и статус сервиса." },
                { q: "Не удается войти", a: "Сбрось пароль и попробуй снова." }
            ]
        }
    };

    const data = platformData[platform];
    const isExternal = data.downloadUrl.startsWith("http");

    return (
        <div className="bg-black min-h-screen text-white pb-20 selection:bg-brand selection:text-black">
            <Section
                container={false}
                className="flex flex-col items-center justify-center text-center px-6 md:px-12"
                style={{ minHeight: 'calc(100vh - var(--nav-height, 0px))' }}
            >
                <Reveal>
                    <h1 className="text-6xl md:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase italic mb-8">
                        {data.title}
                    </h1>
                    <p className="max-w-2xl text-2xl text-white/60 font-medium leading-relaxed mb-20 mx-auto">
                        {data.subtitle}
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <a
                            href={data.downloadUrl}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noreferrer noopener" : undefined}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl font-black shadow-2xl"
                            )}
                        >
                            {data.storeLabel ?? "Скачать установщик"}
                        </a>
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl border-2"
                            )}
                        >
                            Войти в кабинет
                        </Link>
                    </div>
                </Reveal>
            </Section>

            <Section>
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="border border-white/10 rounded-3xl p-6">
                            <div className="text-xs uppercase tracking-[0.25em] text-white/40 mb-2">Версия</div>
                            <div className="text-2xl font-black">{data.version}</div>
                        </div>
                        <div className="border border-white/10 rounded-3xl p-6">
                            <div className="text-xs uppercase tracking-[0.25em] text-white/40 mb-2">Размер</div>
                            <div className="text-2xl font-black">{data.size}</div>
                        </div>
                        <div className="border border-white/10 rounded-3xl p-6">
                            <div className="text-xs uppercase tracking-[0.25em] text-white/40 mb-2">Требования</div>
                            <div className="text-lg text-white/70">
                                {data.requirements.join(", ")}
                            </div>
                        </div>
                    </div>
                    <h2 className="text-5xl font-black mb-12 uppercase tracking-tight">Как начать</h2>
                    <div className="space-y-12">
                        {data.steps.map((step, i) => (
                            <div key={i} className="flex gap-8">
                                <div className="w-16 h-16 rounded-full bg-brand text-black flex items-center justify-center flex-none">
                                    <span className="text-2xl font-black">{i + 1}</span>
                                </div>
                                <div className="flex-1 pt-2">
                                    <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">{step.title}</h3>
                                    {step.text && <p className="text-xl text-white/60">{step.text}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl font-black mb-12 uppercase tracking-tight">
                        {platform === "ios" ? "Если что-то не работает" : "Частые вопросы"}
                    </h2>
                    <div className="space-y-8">
                        {data.issues.map((issue, i) => (
                            <div key={i} className="border-b border-white/10 pb-8 last:border-b-0">
                                <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{issue.q}</h4>
                                {issue.a && <p className="text-lg text-white/60">{issue.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section>
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-5xl font-black mb-8 uppercase tracking-tight">Нужна помощь?</h2>
                    <p className="text-xl text-white/60 mb-12">Если сценарий выше не помог, напиши в поддержку и приложи скрин ошибки.</p>
                    <Link
                        href="/help"
                        className={cn(
                            buttonVariants({ variant: "brand", size: "lg" }),
                            "uppercase tracking-widest text-lg h-16 px-12 rounded-3xl font-black shadow-2xl"
                        )}
                    >
                        Перейти в помощь
                    </Link>
                </div>
            </Section>
        </div>
    );
}
