"use client";

import { useState } from "react";
import { DevicesTable } from "@/components/account/DevicesTable";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { DeviceItem } from "@/lib/account-fixtures";
import { ModuleState } from "@/components/account/KeysTable";

interface DevicesPanelProps {
    devices: DeviceItem[];
    deviceLimit: number;
    state: ModuleState;
}

export function DevicesPanel({ devices, deviceLimit, state }: DevicesPanelProps) {
    const [logoutAllOpen, setLogoutAllOpen] = useState(false);

    return (
        <>
            <DevicesTable
                devices={devices}
                deviceLimit={deviceLimit}
                state={state}
                onLogoutAll={() => setLogoutAllOpen(true)}
            />

            <Modal
                open={logoutAllOpen}
                onClose={() => setLogoutAllOpen(false)}
                title="Выйти со всех устройств"
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal"
                            )}
                        >
                            Подтвердить выход
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogoutAllOpen(false)}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal border-2"
                            )}
                        >
                            Отмена
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-lg">
                        Все активные устройства будут отключены и попросят авторизацию заново.
                    </p>
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-600">
                        Действие мгновенное и влияет на все подключённые устройства.
                    </div>
                </div>
            </Modal>
        </>
    );
}
