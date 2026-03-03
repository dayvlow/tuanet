"use client";

import { useState } from "react";
import { SubscriptionCard } from "@/components/account/SubscriptionCard";
import { BillingHistory } from "@/components/account/BillingHistory";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SubscriptionInfo, PaymentItem } from "@/lib/account-fixtures";
import { ModuleState } from "@/components/account/KeysTable";

interface SubscriptionPanelProps {
    subscription: SubscriptionInfo;
    payments: PaymentItem[];
    state: ModuleState;
}

export function SubscriptionPanel({ subscription, payments, state }: SubscriptionPanelProps) {
    const [cancelOpen, setCancelOpen] = useState(false);

    return (
        <>
            <div className="grid gap-8 lg:grid-cols-2">
                <SubscriptionCard subscription={subscription} state={state} onCancel={() => setCancelOpen(true)} />
                <BillingHistory payments={payments} state={state} />
            </div>

            <Modal
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                title="Отмена подписки"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal"
                            )}
                        >
                            Подтвердить отмену
                        </button>
                        <button
                            type="button"
                            onClick={() => setCancelOpen(false)}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Оставить активной
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-lg">
                        Доступ сохранится до конца периода: <span className="font-bold">15 марта 2026</span>.
                    </p>
                    <div className="rounded-2xl border-2 border-white/10 bg-white/5 p-4 text-xs uppercase tracking-normal text-white/50">
                        Автопродление будет отключено сразу после подтверждения.
                    </div>
                </div>
            </Modal>
        </>
    );
}
