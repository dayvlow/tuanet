"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        function setNavHeight() {
            if (navRef.current) {
                const h = (navRef.current as HTMLElement).offsetHeight;
                document.documentElement.style.setProperty("--nav-height", `${h}px`);
            }
        }

        setNavHeight();
        window.addEventListener("resize", setNavHeight);
        return () => window.removeEventListener("resize", setNavHeight);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/download", label: "Скачать" },
    ];

    if (pathname?.startsWith("/account")) {
        return null;
    }

    return (
        <>
            <motion.nav
                ref={(el) => { navRef.current = el as unknown as HTMLElement; }}
                initial={shouldReduceMotion ? false : { y: -100 }}
                animate={{ y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: "circOut" }}
                className={cn(
                    "fixed top-0 z-50 w-full overflow-visible transition-all duration-300 border-b border-white/5",
                    isScrolled || isMobileMenuOpen
                        ? "bg-black/80 backdrop-blur-xl py-4"
                        : "bg-transparent py-6"
                )}
            >
                <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 overflow-visible">
                    <Link href="/" className="z-50 flex items-center gap-2 group">
                        <span className="text-3xl font-black italic tracking-tighter uppercase text-white group-hover:text-brand transition-colors">ТУАНЕТ</span>
                    </Link>

                    
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-bold uppercase tracking-[0.2em] text-white/70 hover:text-brand hover:scale-105 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex items-center gap-4 ml-6">
                            <Link
                                href="/account"
                                className={cn(
                                    buttonVariants({ variant: "ghost", size: "sm" }),
                                    "text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white"
                                )}
                            >
                                Войти
                            </Link>
                            <Link
                                href="/pricing"
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "sm" }),
                                    "relative z-10 uppercase tracking-widest text-xs font-black shadow-[0_0_14px_rgba(249,115,22,0.28)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                )}
                            >
                                Выбрать тариф
                            </Link>
                        </div>
                    </div>

                    <button
                        className="z-50 md:hidden flex flex-col gap-1.5 p-2 group"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Открыть меню"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <motion.span
                            animate={isMobileMenuOpen ? { rotate: 45, y: 8, backgroundColor: "#F97316" } : { rotate: 0, y: 0, backgroundColor: "#ffffff" }}
                            transition={shouldReduceMotion ? { duration: 0 } : undefined}
                            className="w-8 h-1 bg-white block rounded-full transition-colors group-hover:bg-brand"
                        />
                        <motion.span
                            animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            transition={shouldReduceMotion ? { duration: 0 } : undefined}
                            className="w-8 h-1 bg-white block rounded-full transition-colors group-hover:bg-brand"
                        />
                        <motion.span
                            animate={isMobileMenuOpen ? { rotate: -45, y: -8, backgroundColor: "#F97316" } : { rotate: 0, y: 0, backgroundColor: "#ffffff" }}
                            transition={shouldReduceMotion ? { duration: 0 } : undefined}
                            className="w-8 h-1 bg-white block rounded-full transition-colors group-hover:bg-brand"
                        />
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center space-y-8 md:hidden p-8"
                        role="dialog"
                        aria-modal="true"
                        id="mobile-menu"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.1 + i * 0.1 }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-5xl font-black italic uppercase tracking-tighter text-white hover:text-brand transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
                            className="flex flex-col gap-6 mt-12 w-full max-w-sm"
                        >
                            <Link
                                href="/account"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "lg" }),
                                    "w-full h-16 rounded-3xl justify-center uppercase tracking-widest text-lg font-bold border-2"
                                )}
                            >
                                Войти
                            </Link>
                            <Link
                                href="/pricing"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "lg" }),
                                    "w-full h-16 rounded-3xl justify-center uppercase tracking-widest text-lg font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                )}
                            >
                                Выбрать тариф
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
