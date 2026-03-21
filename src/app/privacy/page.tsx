import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">Конфиденциальность</h1>
                    <Card variant="solid" className="border-zinc-800 p-8 text-white/70">
                        <p>Мы используем только те данные, которые нужны для входа, работы кабинета и поддержки аккаунта.</p>
                        <p className="mt-4">Контактные данные нужны для авторизации, уведомлений и ответа на обращения.</p>
                        <p className="mt-4">Если потребуется удалить данные, это можно запросить через поддержку.</p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
