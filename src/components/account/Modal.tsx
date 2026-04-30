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
    canClose?: boolean;
}

export function Modal({ open, title, onClose, children, footer, size = "md", canClose = true }: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const { body, documentElement } = document;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyPaddingRight = body.style.paddingRight;
        const previousDocumentOverflow = documentElement.style.overflow;
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

        body.style.overflow = "hidden";
        documentElement.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousBodyOverflow;
            body.style.paddingRight = previousBodyPaddingRight;
            documentElement.style.overflow = previousDocumentOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape" && canClose) {
                onClose();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [canClose, open, onClose]);

    const sizeClasses = {
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl",
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-end justify-center px-3 pb-3 pt-12 sm:items-center sm:px-4 sm:pb-4 sm:pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        aria-label="Закрыть окно"
                        onClick={() => {
                            if (canClose) {
                                onClose();
                            }
                        }}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className={cn(
                            "relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[28px] border-4 border-white bg-white text-black shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[32px]",
                            sizeClasses[size]
                        )}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-start justify-between gap-4 border-b-2 border-black/10 px-5 py-5 sm:gap-6 sm:px-8 sm:py-6">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">{title}</h2>
                                <p className="text-sm text-black/60">Все изменения вступают в силу сразу после подтверждения.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (canClose) {
                                        onClose();
                                    }
                                }}
                                disabled={!canClose}
                                className="h-10 w-10 rounded-full border-2 border-black/20 text-lg font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                aria-label="Закрыть"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overscroll-contain overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">{children}</div>
                        {footer && (
                            <div className="border-t-2 border-black/10 px-5 py-5 sm:px-8 sm:py-6">{footer}</div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
