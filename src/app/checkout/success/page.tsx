import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string }>;
}) {
    const params = await searchParams;
    const planLabel = params.plan === "year" ? "Год" : params.plan === "week" ? "Неделя" : "Месяц";

    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-4xl mx-auto text-center">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">Оплата прошла</h1>
                <p className="text-2xl text-white/60 mt-6">
                    Тариф: <span className="text-white font-bold">{planLabel}</span>. Доступ активирован и привязан к аккаунту.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                    {[
                        { step: "1", title: "Скачай приложение", desc: "Выбери свою платформу и установи приложение." },
                        { step: "2", title: "Войди в аккаунт", desc: "Используй email, который указан при оплате." },
                        { step: "3", title: "Нажми «Подключить»", desc: "Готово — сервис активен." },
                    ].map((item) => (
                        <Card key={item.step} variant="solid" className="p-8 border-white/10">
                            <div className="text-4xl font-black text-brand/40 mb-4">0{item.step}</div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{item.title}</h3>
                            <p className="text-lg text-white/60">{item.desc}</p>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        href="/download"
                        className={cn(
                            buttonVariants({ variant: "brand", size: "lg" }),
                            "h-16 px-12 rounded-3xl uppercase tracking-widest text-sm font-bold"
                        )}
                    >
                        Скачать приложение
                    </Link>
                    <Link
                        href="/account"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "h-16 px-12 rounded-3xl uppercase tracking-widest text-sm font-bold border-2"
                        )}
                    >
                        Войти и подключить
                    </Link>
                </div>
            </Section>
        </div>
    );
}
