import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        id: "week",
        name: "Неделя",
        price: "199 ₽",
        period: "7 дней",
        devices: "До 5 устройств",
    },
    {
        id: "month",
        name: "Месяц",
        price: "499 ₽",
        period: "30 дней",
        devices: "До 5 устройств",
        popular: true,
    },
    {
        id: "year",
        name: "Год",
        price: "3 990 ₽",
        period: "365 дней",
        devices: "До 5 устройств",
        popular: true,
    },
];

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string }>;
}) {
    const params = await searchParams;
    const selectedPlan = plans.find((plan) => plan.id === params.plan) ?? plans[1];

    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">Оплата</h1>
                    <p className="text-2xl text-white/60 max-w-2xl mt-6">
                        Проверь срок, заполни данные и подтверди оплату.
                        Доступ откроется в аккаунте сразу после платежа.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card variant="solid" className="p-8 border-white/10 lg:col-span-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Выбери тариф</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <Link
                                    key={plan.id}
                                    href={`/checkout?plan=${plan.id}`}
                                    className={cn(
                                        "rounded-3xl border-2 p-6 transition-colors",
                                        plan.id === selectedPlan.id
                                            ? "border-brand bg-white text-black"
                                            : "border-white/10 bg-black text-white hover:border-white/30"
                                    )}
                                >
                                    <div className="text-xl font-black uppercase tracking-tight">{plan.name}</div>
                                    <div className="text-3xl font-black mt-3">{plan.price}</div>
                                    <div className="text-sm uppercase tracking-[0.2em] text-white/50">за {plan.period}</div>
                                    <div className="mt-4 text-sm text-white/60">{plan.devices}</div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-10">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Данные для оплаты</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="checkout-email" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Email</label>
                                    <input
                                        id="checkout-email"
                                        type="email"
                                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout-name" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Имя</label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                        placeholder="Иван"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout-country" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Страна</label>
                                    <input
                                        id="checkout-country"
                                        type="text"
                                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                        placeholder="Россия"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout-payment" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Способ оплаты</label>
                                    <input
                                        id="checkout-payment"
                                        type="text"
                                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                        placeholder="Банковская карта"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 space-y-3 text-sm text-white/60">
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 h-4 w-4" />
                                    <span>Соглашаюсь с <Link href="/terms" className="text-white hover:text-brand">условиями использования</Link></span>
                                </label>
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 h-4 w-4" />
                                    <span>Понимаю условия <Link href="/refund" className="text-white hover:text-brand">возврата</Link></span>
                                </label>
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 h-4 w-4" />
                                    <span>Автопродление можно отключить в кабинете</span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    <Card variant="default" className="p-8 h-fit">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Итого</h2>
                        <div className="space-y-4 text-lg text-black/70">
                            <div className="flex items-center justify-between">
                                <span>Тариф</span>
                                <span className="font-bold text-black">{selectedPlan.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Срок</span>
                                <span className="font-bold text-black">{selectedPlan.period}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Лимит</span>
                                <span className="font-bold text-black">{selectedPlan.devices}</span>
                            </div>
                            <div className="border-t border-black/10 pt-4 flex items-center justify-between text-2xl">
                                <span>К оплате</span>
                                <span className="font-black text-black">{selectedPlan.price}</span>
                            </div>
                        </div>
                        <Link
                            href={`/checkout/success?plan=${selectedPlan.id}`}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "w-full h-16 mt-8 rounded-3xl uppercase tracking-widest text-sm font-bold"
                            )}
                        >
                            Оплатить
                        </Link>
                        <p className="text-xs text-black/60 mt-4">
                            Оплата обрабатывается безопасным платежным провайдером.
                        </p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
