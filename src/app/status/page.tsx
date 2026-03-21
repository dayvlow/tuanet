import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function StatusPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 text-white selection:bg-brand selection:text-black">
            <Section>
                <div className="max-w-4xl space-y-10">
                    <div>
                        <h1 className="text-6xl font-black uppercase tracking-tight md:text-8xl">Статус сервиса</h1>
                        <p className="mt-6 text-xl text-white/60">Здесь можно быстро проверить, все ли в порядке с основными компонентами сервиса.</p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            ["Серверы доступа", "Online"],
                            ["Авторизация", "Online"],
                            ["Выдача ключей", "Подготовка"],
                            ["Поддержка", "Online"],
                        ].map(([label, status]) => (
                            <Card key={label} variant="solid" className="border-zinc-800 p-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-xl font-black uppercase tracking-tight">{label}</div>
                                    <div className="rounded-full border-2 border-white/20 bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-normal">
                                        {status}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}
