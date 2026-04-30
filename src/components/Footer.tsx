import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SupportLink } from "@/components/ui/SupportLink";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pb-[calc(1.5rem+var(--safe-bottom))] pt-16 text-white md:pt-24 md:pb-12">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
                <div className="mb-16 grid grid-cols-1 gap-10 md:mb-24 md:grid-cols-4 md:gap-12">
                    <div className="space-y-6 md:col-span-1 md:space-y-8">
                        <Link href="/" aria-label="Туанет" className="block w-[9rem] text-white transition-colors hover:text-brand md:w-[11rem]">
                            <BrandLogo />
                        </Link>
                        <p className="max-w-xs text-base leading-relaxed text-white/60 md:text-lg">
                            Простой сервис для подключения, управления устройствами и контроля доступа в одном кабинете.
                        </p>
                        <div className="text-sm text-white/50">
                            Поддержка:{" "}
                            <SupportLink
                                href="https://t.me/tuanet_chat_support"
                                channel="telegram"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-white transition-colors hover:text-brand"
                            >
                                t.me/tuanet_chat_support
                            </SupportLink>
                        </div>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Продукт</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Главная</Link></li>
                            <li><Link href="/about" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">О продукте</Link></li>
                            <li><Link href="/download" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Скачать</Link></li>
                            <li><Link href="/help" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Помощь</Link></li>
                        </ul>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Кабинет</h4>
                        <ul className="space-y-4">
                            <li><Link href="/login" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Войти</Link></li>
                            <li><Link href="/login" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Регистрация</Link></li>
                            <li><Link href="/account/security" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Безопасность</Link></li>
                            <li><Link href="/account/profile" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Профиль</Link></li>
                        </ul>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Документы</h4>
                        <ul className="space-y-4">
                            <li><Link href="/terms" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Условия</Link></li>
                            <li><Link href="/privacy" className="text-lg font-bold transition-colors hover:text-brand md:text-xl">Политика конфиденциальности</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-left text-sm font-medium uppercase tracking-wider text-white/40 md:flex-row md:items-center md:justify-between">
                    <p>&copy; Туанет, {new Date().getFullYear()}. Все права защищены.</p>
                    <div className="flex flex-wrap gap-4 md:gap-8">
                        <SupportLink
                            href="https://t.me/tuanet_chat_support"
                            channel="telegram"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:text-white transition-colors"
                        >
                            Поддержка
                        </SupportLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
