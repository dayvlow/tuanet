import { AccountShell } from "@/components/account/AccountShell";
import Link from "next/link";
import {
    keysFixture,
    devicesFixture,
    deviceLimit,
} from "@/lib/account-fixtures";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function AccountDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    const activeKeys = keysFixture.filter((key) => key.status === "active").length;
    const totalKeys = keysFixture.length;
    const devicesConnected = devicesFixture.length;

    return (
        <AccountShell
            title="Обзор"
            description="Контроль доступа и безопасности"
            primaryAction={{ label: "Создать ключ", href: "/account/keys" }}
            quickActions={quickActions}
        >
            <div className="grid gap-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-white/40">Ключи доступа</div>
                        <div className="mt-4 text-4xl font-black uppercase tracking-tight">{activeKeys} активных</div>
                        <div className="text-sm text-white/60">Всего ключей: {totalKeys}</div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account/keys"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                )}
                            >
                                Управлять ключами
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-white/40">Устройства</div>
                        <div className="mt-4 text-4xl font-black uppercase tracking-tight">
                            {devicesConnected} из {deviceLimit}
                        </div>
                        <div className="text-sm text-white/60">Подключенные устройства</div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account/devices"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                )}
                            >
                                Управлять устройствами
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-white/40">Безопасность</div>
                        <div className="mt-4 text-3xl font-black uppercase tracking-tight">2FA выключена</div>
                        <div className="text-sm text-white/60">Рекомендуем включить для защиты аккаунта.</div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account/security"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                )}
                            >
                                Перейти в безопасность
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-white/40">Профиль</div>
                        <div className="mt-4 text-3xl font-black uppercase tracking-tight">Данные аккаунта</div>
                        <div className="text-sm text-white/60">Проверь email и обнови пароль.</div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account/profile"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "h-10 px-4 text-xs uppercase tracking-normal border-2"
                                )}
                            >
                                Открыть профиль
                            </Link>
                        </div>
                    </div>
                </div>

                {state !== "success" && (
                    <div className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
                        <div className="text-xs font-bold uppercase tracking-normal text-white/40">Состояние</div>
                        <div className="mt-4 text-2xl font-black uppercase tracking-tight">
                            {state === "loading" && "Загрузка данных"}
                            {state === "empty" && "Нет данных"}
                            {state === "error" && "Ошибка загрузки"}
                        </div>
                        <div className="text-sm text-white/60">Эти состояния видны в соответствующих вкладках.</div>
                    </div>
                )}
            </div>
        </AccountShell>
    );
}
