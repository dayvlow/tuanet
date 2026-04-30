"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextValue {
    theme: ThemeMode;
    toggleTheme: () => void;
}

const STORAGE_KEY = "tuaanet-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): ThemeMode {
    if (typeof document !== "undefined") {
        const current = document.documentElement.dataset.theme;
        if (current === "light" || current === "dark") {
            return current;
        }
    }

    if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
            return stored;
        }
    }

    return "dark";
}

function applyTheme(theme: ThemeMode) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

    useEffect(() => {
        applyTheme(theme);
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
