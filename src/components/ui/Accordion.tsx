"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onClick?: () => void;
}

export function AccordionItem({ title, children, isOpen, onClick }: AccordionItemProps) {
    const id = React.useId();
    const buttonId = `${id}-button`;
    const contentId = `${id}-content`;

    return (
        <div className="border-b border-border py-6 first:border-t min-w-0">
            <button
                onClick={onClick}
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                id={buttonId}
                className="flex w-full items-center justify-between text-left text-2xl font-medium tracking-tight hover:opacity-70 transition-opacity min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
                <span className="min-w-0 break-words">{title}</span>
                <span className={cn("text-xl transition-transform", isOpen ? "rotate-45" : "")}>
                    +
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={contentId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto", marginTop: 24 },
                            collapsed: { opacity: 0, height: 0, marginTop: 0 },
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl break-words w-full">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="w-full">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    );
}
