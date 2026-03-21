"use client";

import { useState } from "react";
import { CreateKeyInput, KeyItem } from "@/lib/account-types";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface KeyCreateModalProps {
    open: boolean;
    onClose: () => void;
    onCreateKey?: (input: CreateKeyInput) => Promise<KeyItem> | KeyItem;
}

export function KeyCreateModal({ open, onClose, onCreateKey }: KeyCreateModalProps) {
    const [created, setCreated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedKey, setGeneratedKey] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [region, setRegion] = useState("Германия");
    const [deviceType, setDeviceType] = useState("Windows");
    const [keyType, setKeyType] = useState<"VPN" | "VPN + белые списки">("VPN");
    const [notice, setNotice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetState() {
        setCreated(false);
        setCopied(false);
        setGeneratedKey("");
        setDeviceName("");
        setRegion("Германия");
        setDeviceType("Windows");
        setKeyType("VPN");
        setNotice("");
        setIsSubmitting(false);
    }

    function handleClose() {
        resetState();
        onClose();
    }

    async function handleCreate() {
        setNotice("");
        setIsSubmitting(true);

        try {
            const key = await onCreateKey?.({
                deviceName,
                region,
                deviceType,
                keyType,
            });

            if (!key) {
                setNotice("Не удалось создать ключ. Попробуйте еще раз.");
                return;
            }

            setGeneratedKey(key.token ?? `tuaanet-${key.id}-${key.last4}`);
            setCreated(true);
            setCopied(false);
        } catch {
            setNotice("Не удалось создать ключ. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(generatedKey);
        setCopied(true);
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Создать новый ключ"
            footer={
                <div className="flex justify-center">
                    {!created ? (
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={isSubmitting}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal",
                                isSubmitting && "pointer-events-none opacity-60"
                            )}
                        >
                            {isSubmitting ? "Создаем..." : "Создать ключ"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleClose}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "sm" }),
                                "h-11 px-6 text-xs uppercase tracking-normal"
                            )}
                        >
                            Готово
                        </button>
                    )}
                </div>
            }
        >
            {!created ? (
                <div className="grid gap-4">
                    {notice && (
                        <div className="rounded-2xl border-2 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                            {notice}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Имя устройства</label>
                        <input
                            type="text"
                            value={deviceName}
                            onChange={(event) => setDeviceName(event.target.value)}
                            placeholder="Например: Рабочий ноутбук"
                            className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-sm font-semibold"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Регион</label>
                            <select
                                value={region}
                                onChange={(event) => setRegion(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-xs font-bold uppercase tracking-normal"
                            >
                                <option>Германия</option>
                                <option>Нидерланды</option>
                                <option>Финляндия</option>
                                <option>США</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Тип устройства</label>
                            <select
                                value={deviceType}
                                onChange={(event) => setDeviceType(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-xs font-bold uppercase tracking-normal"
                            >
                                <option>Windows</option>
                                <option>macOS</option>
                                <option>iPhone / iPad</option>
                                <option>Android</option>
                                <option>Linux</option>
                                <option>Роутер</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Тип ключа</label>
                        <select
                            value={keyType}
                            onChange={(event) =>
                                setKeyType(event.target.value as "VPN" | "VPN + белые списки")
                            }
                            className="mt-2 h-12 w-full rounded-2xl border-2 border-black/20 px-4 text-xs font-bold uppercase tracking-normal"
                        >
                            <option>VPN</option>
                            <option>VPN + белые списки</option>
                        </select>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-3xl border-2 border-brand bg-brand/10 p-6">
                        <div className="text-xs font-bold uppercase tracking-normal text-brand">Показываем один раз</div>
                        <p className="mt-2 text-lg font-semibold">Скопируй ключ сейчас. Потом он больше не покажется.</p>
                    </div>
                    <div className="rounded-2xl border-2 border-black/20 bg-black/5 p-4 text-lg font-black tracking-normal">
                        {generatedKey}
                    </div>
                    <div className="text-sm text-black/60">
                        Устройство: <span className="font-bold">{deviceName.trim() || `${deviceType} ${region}`}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleCopy()}
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

interface KeyRevokeModalProps {
    open: boolean;
    onClose: () => void;
    keyItem?: KeyItem | null;
    onConfirm?: (keyItem: KeyItem) => Promise<void> | void;
}

export function KeyRevokeModal({ open, onClose, keyItem, onConfirm }: KeyRevokeModalProps) {
    const [notice, setNotice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Отозвать ключ"
            footer={
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={async () => {
                            setNotice("");
                            setIsSubmitting(true);

                            if (keyItem) {
                                try {
                                    await onConfirm?.(keyItem);
                                } catch {
                                    setNotice("Не удалось отозвать ключ. Попробуйте еще раз.");
                                    setIsSubmitting(false);
                                    return;
                                }
                            }
                            setIsSubmitting(false);
                            onClose();
                        }}
                        disabled={isSubmitting}
                        className={cn(
                            buttonVariants({ variant: "brand", size: "sm" }),
                            "h-11 px-6 text-xs uppercase tracking-normal",
                            isSubmitting && "pointer-events-none opacity-60"
                        )}
                    >
                        {isSubmitting ? "Обновляем..." : "Подтвердить отзыв"}
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
                {notice && (
                    <div className="rounded-2xl border-2 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                        {notice}
                    </div>
                )}
                <p className="text-lg">
                    Ключ <span className="font-bold">{keyItem?.name ?? ""}</span> будет отключен. Устройства ниже потеряют доступ.
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
                        <div className="text-sm text-black/60">С этим ключом сейчас не связано активных устройств.</div>
                    )}
                </div>
                <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 text-xs uppercase tracking-normal text-red-600">
                    Это действие нельзя отменить. Подключения на этом ключе будут остановлены.
                </div>
            </div>
        </Modal>
    );
}
