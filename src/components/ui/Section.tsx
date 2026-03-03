import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: boolean;
    padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export function Section({
    children,
    className,
    container = true,
    padding = "lg",
    ...props
}: SectionProps) {
    const paddingClasses = {
        none: "",
        sm: "py-8 md:py-12",
        md: "py-12 md:py-24",
        lg: "py-16 md:py-32",
        xl: "py-24 md:py-48",
    };

    return (
        <section
            className={cn(paddingClasses[padding], className)}
            {...props}
        >
            {container ? (
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12">{children}</div>
            ) : (
                children
            )}
        </section>
    );
}
