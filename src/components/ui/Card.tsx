import { cn } from "@/lib/utils";
import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "solid" | "outline";
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
    className,
    children,
    variant = "default",
    padding = "md",
    ...props
}: CardProps) {
    const variants = {
        default: "bg-white text-black border border-white/20",
        solid: "bg-zinc-900 text-white border border-zinc-800",
        outline: "bg-transparent text-white border border-white/20 backdrop-blur-sm",
    };

    const paddings = {
        none: "",
        sm: "p-6",
        md: "p-8 md:p-10",
        lg: "p-12 md:p-16",
    };

    return (
        <div
            className={cn(
                "rounded-3xl md:rounded-3xl relative overflow-hidden transition-all duration-300",
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
