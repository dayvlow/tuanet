"use client";

import { useMemo, useState } from "react";
import { KeyItem } from "@/lib/account-fixtures";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface KeyCreateModalProps {
    open: boolean;
    onClose: () => void;
}

export function KeyCreateModal({ open, onClose }: KeyCreateModalProps) {
    const [created, setCreated] = useState(false);
    const [copied, setCopied] = useState(false);

    const generatedKey = useMemo(() => "tua_9F4D1B9E_7C2A_01", []);

    return (
        <Modal
            open={open}
            onClose={() => {
                setCreated(false);
                setCopied(false);
                onClose();
            }}
            title="Создать новый ключ"
            footer={
                <div className="flex flex-wrap gap-3">
                    {!created ? (
                        <button
                            type="button"
                            onClick={() => setCreated(true)}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal"
                            )}
                        >
                            Создать ключ
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal"
                            )}
                        >
                            Готово
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
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
            {!created ? (
                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Название</label>
                        <input
                            type="text"
                            placeholder="Например: Основной ключ"
                            className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-sm font-semibold"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Срок действия</label>
                            <select className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-xs font-bold uppercase tracking-normal">
                                <option>Без срока</option>
                                <option>30 дней</option>
                                <option>90 дней</option>
                                <option>1 год</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Лимит устройств</label>
                            <input
                                type="number"
                                placeholder="5"
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-sm font-semibold"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Лимит сессий</label>
                        <input
                            type="number"
                            placeholder="10"
                            className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-sm font-semibold"
                        />
                    </div>
                    <div className="rounded-2xl border-2 border-black/10 bg-black/5 p-4 text-xs uppercase tracking-normal text-black/50">
                        Assumption: ограничения можно задавать для каждого ключа.
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-3xl border-2 border-brand bg-brand/10 p-6">
                        <div className="text-xs font-bold uppercase tracking-normal text-brand">Показываем один раз</div>
                        <p className="mt-2 text-lg font-semibold">Скопируй ключ и сохрани в безопасном месте.</p>
                    </div>
                    <div className="rounded-2xl border-2 border-black/20 bg-black/5 p-4 text-lg font-black tracking-normal">
                        {generatedKey}
                    </div>
                    <button
                        type="button"
                        onClick={() => setCopied(true)}
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-10 px-5 text-xs uppercase tracking-normal border-2"
                        )}
                    >
                        {copied ? "Скопировано" : "Скопировать"}
                    </button>
                </div>
            )}
        </Modal>
    );
}

interface KeyRotateModalProps {
    open: boolean;
    onClose: () => void;
    keyItem?: KeyItem | null;
}

export function KeyRotateModal({ open, onClose, keyItem }: KeyRotateModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Ротация ключа"
            footer={
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className={cn(
                            buttonVariants({ variant: "brand", size: "sm" }),
                            "h-11 px-6 text-xs uppercase tracking-normal"
                        )}
                    >
                        Создать новый ключ
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
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
                    Новый ключ будет создан для <span className="font-bold">{keyItem?.name ?? "ключа"}</span>.
                </p>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Отключить старый через</label>
                    <select className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-xs font-bold uppercase tracking-normal">
                        <option>10 минут</option>
                        <option>30 минут</option>
                        <option>1 час</option>
                    </select>
                </div>
                <div className="rounded-2xl border-2 border-black/10 bg-black/5 p-4 text-xs uppercase tracking-normal text-black/50">
                    Старый ключ будет активен до окончания таймера, затем отключится автоматически.
                </div>
            </div>
        </Modal>
    );
}

interface KeyRevokeModalProps {
    open: boolean;
    onClose: () => void;
    keyItem?: KeyItem | null;
}

export function KeyRevokeModal({ open, onClose, keyItem }: KeyRevokeModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Отозвать ключ"
            footer={
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className={cn(
                            buttonVariants({ variant: "brand", size: "sm" }),
                            "h-11 px-6 text-xs uppercase tracking-normal"
                        )}
                    >
                        Подтвердить отзыв
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
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
                    Ключ <span className="font-bold">{keyItem?.name ?? ""}</span> будет отозван. Устройства ниже потеряют доступ.
                </p>
                <div className="rounded-3xl border-2 border-black/10 bg-black/5 p-4">
                    {(keyItem?.affectedDevices?.length ?? 0) > 0 ? (
                        <ul className="space-y-2 text-sm font-semibold">
                            {keyItem?.affectedDevices?.map((device) => (
                                <li key={device} className="flex items-center justify-between">
                                    <span>{device}</span>
                                    <span className="text-xs uppercase tracking-normal text-black/40">отключится</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-black/60">Нет активных устройств, связанных с ключом.</div>
                    )}
                </div>
                <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-600">
                    Действие необратимо. Подключения на этом ключе будут остановлены.
                </div>
            </div>
        </Modal>
    );
}
