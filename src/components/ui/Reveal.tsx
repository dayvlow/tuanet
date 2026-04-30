"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface RevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    overflow?: "hidden" | "visible";
    delay?: number;
    duration?: number;
    y?: number;
}

export const Reveal = ({
    children,
    width = "fit-content",
    overflow = "hidden",
    delay = 0.25,
    duration = 0.5,
    y = 20,
}: RevealProps) => {
    const ref = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const isInView = useInView(ref, { once: true });

    if (shouldReduceMotion) {
        return (
            <div ref={ref} style={{ position: "relative", width }}>
                {children}
            </div>
        );
    }

    return (
        <div ref={ref} style={{ position: "relative", width, overflow }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: y },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration, delay, ease: [0.25, 0.25, 0.25, 0.75] }}
            >
                {children}
            </motion.div>
        </div>
    );
};
