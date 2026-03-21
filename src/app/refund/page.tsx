import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">Возвраты</h1>
                    <Card variant="solid" className="border-zinc-800 p-8 text-white/70">
                        <p>Если сервис не подошел, первый платеж можно вернуть в течение 7 дней.</p>
                        <p className="mt-4">Для запроса напиши в поддержку и укажи email аккаунта и дату оплаты.</p>
                        <p className="mt-4">После подтверждения возврата доступ будет отключен, а активные ключи перестанут работать.</p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
