import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">Условия использования</h1>
                    <Card variant="solid" className="border-zinc-800 p-8 text-white/70">
                        <p>Сервис предоставляется для личного использования владельцем аккаунта и его устройств.</p>
                        <p className="mt-4">Передача доступа третьим лицам, злоупотребление лимитами и попытки нарушить работу сервиса запрещены.</p>
                        <p className="mt-4">Поддержка оставляет за собой право ограничить доступ при нарушении правил или угрозе безопасности.</p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
