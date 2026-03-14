import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-5xl space-y-10">
                    <div>
                        <h1 className="text-6xl font-black uppercase tracking-tight md:text-8xl">Помощь</h1>
                        <p className="mt-6 max-w-3xl text-xl text-white/60">
                            Быстрые контакты, сценарии установки и базовые действия, если что-то пошло не так.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card variant="solid" className="border-zinc-800 p-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Что проверить сначала</h2>
                            <ul className="mt-6 space-y-3 text-white/70">
                                <li>Проверь, что приложение установлено под нужную платформу.</li>
                                <li>Убедись, что вход выполнен под правильным аккаунтом.</li>
                                <li>Если ключ не работает, создай новый в разделе `Ключи`.</li>
                                <li>Если доступ всё равно не поднимается, свяжись с поддержкой.</li>
                            </ul>
                        </Card>
                        <Card id="contact" variant="outline" className="border-white/15 p-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Контакты поддержки</h2>
                            <div className="mt-6 space-y-4 text-lg">
                                <p className="text-white/70">Email: `support@tuaanet.com`</p>
                                <p className="text-white/70">Ответ в рабочее время обычно занимает до 15 минут.</p>
                                <a
                                    href="mailto:support@tuaanet.com?subject=TuAnet%20Support"
                                    className="inline-flex rounded-full border-2 border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-white/10"
                                >
                                    Написать в поддержку
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>
            </Section>
        </div>
    );
}
