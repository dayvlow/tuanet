"use client";

import { useState } from "react";
import { KeyItem } from "@/lib/account-fixtures";
import { Modal } from "@/components/account/Modal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface KeyCreateModalProps {
    open: boolean;
    onClose: () => void;
    onCreateKey?: (key: KeyItem) => void;
}

function generateLast4() {
    return Math.random().toString(16).slice(2, 6).toUpperCase();
}

export function KeyCreateModal({ open, onClose, onCreateKey }: KeyCreateModalProps) {
    const [created, setCreated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedKey, setGeneratedKey] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [region, setRegion] = useState("Германия");
    const [deviceType, setDeviceType] = useState("Windows");
    const [keyType, setKeyType] = useState("VPN");

    function resetState() {
        setCreated(false);
        setCopied(false);
        setGeneratedKey("");
        setDeviceName("");
        setRegion("Германия");
        setDeviceType("Windows");
        setKeyType("VPN");
    }

    function handleClose() {
        resetState();
        onClose();
    }

    function handleCreate() {
        const last4 = generateLast4();
        const normalizedName = deviceName.trim() || `${deviceType} ${region}`;
        const value = `tua_${last4}_${region.slice(0, 2).toUpperCase()}_${deviceType.slice(0, 2).toUpperCase()}`;

        onCreateKey?.({
            id: `key_${Date.now()}`,
            name: normalizedName,
            type: keyType === "VPN" ? "Device" : "API",
            last4,
            createdAt: "Сегодня",
            lastActive: "Не использовался",
            status: "active",
            affectedDevices: [normalizedName],
        });

        setGeneratedKey(value);
        setCreated(true);
        setCopied(false);
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
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-normal text-black/50">Имя устройства</label>
                        <input
                            type="text"
                            value={deviceName}
                            onChange={(event) => setDeviceName(event.target.value)}
                            placeholder="Например: MacBook Алексея"
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
                            onChange={(event) => setKeyType(event.target.value)}
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
                        <p className="mt-2 text-lg font-semibold">Скопируй ключ и сохрани в безопасном месте.</p>
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
    onConfirm?: (keyItem: KeyItem) => void;
}

export function KeyRevokeModal({ open, onClose, keyItem, onConfirm }: KeyRevokeModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Отозвать ключ"
            footer={
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (keyItem) {
                                onConfirm?.(keyItem);
                            }
                            onClose();
                        }}
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
