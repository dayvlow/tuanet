"use client";

import Link from "next/link";
import { PaymentItem } from "@/lib/account-fixtures";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ModuleState } from "@/components/account/KeysTable";

interface BillingHistoryProps {
    payments: PaymentItem[];
    state?: ModuleState;
}

export function BillingHistory({ payments, state = "success" }: BillingHistoryProps) {
    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">История платежей</h2>
                    <p className="text-base font-medium leading-relaxed text-white/40">Чеки и инвойсы</p>
                </div>

                {state === "loading" && (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-2xl bg-white/5" />
                        ))}
                        <div className="text-base font-medium leading-relaxed text-white/40">Загрузка истории…</div>
                    </div>
                )}

                {state === "error" && (
                    <div className="rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6">
                        <div className="text-base font-medium leading-relaxed text-red-600">Ошибка платежей</div>
                        <p className="mt-2 text-lg">Не удалось загрузить историю.</p>
                    </div>
                )}

                {state === "empty" && (
                    <div className="rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Платежей пока нет</h3>
                        <p className="mt-3 text-base font-medium leading-relaxed text-white/40">После оплаты здесь появятся чеки</p>
                    </div>
                )}

                {state === "success" && (
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex flex-col gap-4 rounded-3xl border-2 border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div>
                                    <div className="text-lg font-black uppercase tracking-tight">{payment.date}</div>
                                    <div className="text-sm text-white/60">{payment.method}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-lg font-bold">{payment.amount}</span>
                                    <span className="rounded-full border-2 border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-normal">
                                        {payment.status === "paid" ? "Оплачен" : payment.status === "refunded" ? "Возврат" : "Ошибка"}
                                    </span>
                                    <Link
                                        href={payment.invoiceUrl ?? "/help#contact"}
                                        className={cn(
                                            buttonVariants({ variant: "outline", size: "sm" }),
                                            "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                        )}
                                    >
                                        Скачать чек
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
