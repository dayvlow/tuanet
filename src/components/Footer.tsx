import Link from "next/link";

import { Button } from "./ui/Button";

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/10">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="md:col-span-1 space-y-8">
                        <Link href="/" className="text-4xl font-black italic tracking-tighter uppercase block">
                            Туанет
                        </Link>
                        <p className="text-white/60 text-lg leading-relaxed max-w-xs">
                            Подключился и поехал. Управляй подпиской и устройствами в одном месте.
                        </p>
                        <div className="text-sm text-white/50">
                            Поддержка: <a href="mailto:support@tuaanet.com" className="text-white hover:text-brand transition-colors">support@tuaanet.com</a>
                        </div>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Продукт</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-xl font-bold hover:text-brand transition-colors">Главная</Link></li>
                            <li><Link href="/pricing" className="text-xl font-bold hover:text-brand transition-colors">Тарифы</Link></li>
                            <li><Link href="/download" className="text-xl font-bold hover:text-brand transition-colors">Скачать</Link></li>
                            <li><Link href="/help" className="text-xl font-bold hover:text-brand transition-colors">Помощь</Link></li>
                        </ul>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Кабинет</h4>
                        <ul className="space-y-4">
                            <li><Link href="/account" className="text-xl font-bold hover:text-brand transition-colors">Войти</Link></li>
                            <li><Link href="/account/subscription" className="text-xl font-bold hover:text-brand transition-colors">Подписка</Link></li>
                            <li><Link href="/account/devices" className="text-xl font-bold hover:text-brand transition-colors">Устройства</Link></li>
                            <li><Link href="/account/payments" className="text-xl font-bold hover:text-brand transition-colors">Платежи</Link></li>
                        </ul>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Документы</h4>
                        <ul className="space-y-4">
                            <li><Link href="/terms" className="text-xl font-bold hover:text-brand transition-colors">Условия</Link></li>
                            <li><Link href="/privacy" className="text-xl font-bold hover:text-brand transition-colors">Конфиденциальность</Link></li>
                            <li><Link href="/refund" className="text-xl font-bold hover:text-brand transition-colors">Возвраты</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40 font-medium uppercase tracking-wider">
                    <p>&copy; Туанет, {new Date().getFullYear()}. Все права защищены.</p>
                    <div className="flex gap-8">
                        <Link href="/help#contact" className="hover:text-white transition-colors">Поддержка</Link>
                        <Link href="/status" className="hover:text-white transition-colors">Статус сервиса</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
