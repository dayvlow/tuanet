"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg";
}

export function Modal({ open, title, onClose, children, footer, size = "md" }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const sizeClasses = {
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl",
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        aria-label="Закрыть окно"
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className={cn(
                            "relative w-full rounded-[32px] border-4 border-white bg-white text-black shadow-[0_0_40px_rgba(249,115,22,0.2)]",
                            sizeClasses[size]
                        )}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-start justify-between gap-6 border-b-2 border-black/10 px-8 py-6">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
                                <p className="text-sm text-black/60">Все изменения вступают в силу сразу после подтверждения.</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 w-10 rounded-full border-2 border-black/20 text-lg font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                aria-label="Закрыть"
                            >
                                ×
                            </button>
                        </div>
                        <div className="px-8 py-6">{children}</div>
                        {footer && (
                            <div className="border-t-2 border-black/10 px-8 py-6">{footer}</div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
