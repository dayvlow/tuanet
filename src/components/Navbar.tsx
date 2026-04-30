"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        function setNavHeight() {
            if (navRef.current) {
                document.documentElement.style.setProperty("--nav-height", `${navRef.current.offsetHeight}px`);
            }
        }

        setNavHeight();
        window.addEventListener("resize", setNavHeight);
        return () => window.removeEventListener("resize", setNavHeight);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 24);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname?.startsWith("/account")) {
        return null;
    }

    return (
        <nav
            ref={navRef}
            className={cn(
                "fixed top-0 z-50 w-full border-b border-white/5 transition-all duration-300",
                isScrolled ? "bg-black/85 py-3 backdrop-blur-xl" : "bg-black/70 py-4 backdrop-blur-md"
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 md:px-12">
                <Link href="/" aria-label="Туанет" className="flex items-center text-white transition-colors hover:text-brand">
                    <BrandLogo className="w-[7.25rem] sm:w-[8.5rem] md:w-[9.5rem]" />
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/download"
                        className="text-sm font-black uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white"
                    >
                        Скачать
                    </Link>
                    <Link
                        href="/login"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-11 rounded-full px-4 text-sm font-black uppercase tracking-[0.18em] text-white/80 hover:text-white sm:px-5"
                        )}
                    >
                        Войти
                    </Link>
                </div>
            </div>
        </nav>
    );
}
