import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">Условия использования</h1>
                    <Card variant="solid" className="border-zinc-800 p-8 text-white/70">
                        <p>Сервис предназначен для личного использования владельцем аккаунта и его устройств.</p>
                        <p className="mt-4">Нельзя передавать доступ другим людям, обходить лимиты или мешать работе сервиса.</p>
                        <p className="mt-4">Если правила нарушаются или появляется риск для сервиса, доступ может быть ограничен.</p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
