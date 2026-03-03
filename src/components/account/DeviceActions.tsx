"use client";

import { cn } from "@/lib/utils";

interface DeviceActionsProps {
    onRename?: () => void;
    onDisconnect?: () => void;
}

export function DeviceActions({ onRename, onDisconnect }: DeviceActionsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={onRename}
                className={cn(
                    "rounded-full border-2 border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-normal text-white hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                )}
            >
                Переименовать
            </button>
            <button
                type="button"
                onClick={onDisconnect}
                className={cn(
                    "rounded-full border-2 border-red-300/30 px-3 py-2 text-xs font-bold uppercase tracking-normal text-red-300/90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                )}
            >
                Отключить
            </button>
        </div>
    );
}
