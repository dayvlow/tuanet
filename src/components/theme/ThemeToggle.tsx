"use client";

import { SunMoon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={cn("theme-toggle", className)}
            aria-label={theme === "dark" ? "Включить дневной режим" : "Включить ночной режим"}
        >
            <SunMoon className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">Режим</span>
        </button>
    );
}
