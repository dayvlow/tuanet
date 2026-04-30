import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export default function StatusPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic">Статус сервиса</h1>
                <p className="text-2xl text-white/60 max-w-2xl">
                    Актуальная информация о доступности сервисов и приложений.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    {[
                        { title: "Приложения", status: "Работает стабильно" },
                        { title: "Оплата", status: "Работает стабильно" },
                        { title: "Кабинет", status: "Работает стабильно" },
                        { title: "Подключение", status: "Работает стабильно" },
                    ].map((item) => (
                        <Card key={item.title} variant="solid" className="p-8 border-white/10">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{item.title}</h2>
                            <p className="text-lg text-white/70">{item.status}</p>
                        </Card>
                    ))}
                </div>
            </Section>
        </div>
    );
}
