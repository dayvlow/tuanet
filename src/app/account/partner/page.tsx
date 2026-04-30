import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { PartnerConsole } from "@/components/account/PartnerConsole";
import {
    BackendAccount,
    BackendPartnerOverview,
    TELEGRAM_BOT_USERNAME,
    getAccountHomePath,
    getAccountDisplayLabel,
} from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const quickActions = [
    { label: "Партнёрка", href: "/account/partner" },
    { label: "Финансы", href: "/account/partner/finance" },
    { label: "Профиль", href: "/account/profile" },
];

export default async function PartnerPage() {
    let state: "success" | "forbidden" | "error" = "success";
    let token: string | null = null;
    let account: BackendAccount | null = null;
    let overview: BackendPartnerOverview | null = null;

    try {
        const session = await requireSessionAccount("partner");
        token = session.token;
        account = session.account;
    } catch (error) {
        rethrowNavigationSignal(error);
        if (error instanceof Error && error.message.includes("Role required")) {
            state = "forbidden";
        } else {
            state = "error";
        }
    }

    if (account?.portal === "staff") {
        redirect(getAccountHomePath(account));
    }

    if (state === "success" && account?.portal === "partner") {
        try {
            overview = await fetchBackendJson<BackendPartnerOverview>("/partner/overview", { token: token ?? undefined });
        } catch (error) {
            if (error instanceof Error && error.message.includes("Role required")) {
                state = "forbidden";
            } else {
                state = "error";
            }
        }
    } else if (state === "success") {
        state = "forbidden";
    }

    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;

    return (
        <AccountShell
            title="Партнёрский кабинет"
            description="Реферальные ссылки, уровни и бонусы"
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal ?? "partner"}
            accessStatusText={overview?.profile.is_active === false ? "Отключён" : "Online"}
            accessStatusTone={overview?.profile.is_active === false ? "danger" : "success"}
        >
            {state === "forbidden" && (
                <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-8 text-white">
                    <div className="text-xs font-bold uppercase tracking-normal text-red-300">Доступ закрыт</div>
                    <div className="mt-4 text-3xl font-black uppercase tracking-tight">Нужна отдельная партнёрская учётка</div>
                    <div className="mt-2 text-sm text-white/70">
                        Для входа в партнёрский кабинет нужен отдельный аккаунт с доступом партнёра.
                    </div>
                </div>
            )}

            {state === "error" && (
                <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-8 text-white">
                    <div className="text-xs font-bold uppercase tracking-normal text-red-300">Ошибка</div>
                    <div className="mt-4 text-3xl font-black uppercase tracking-tight">Не удалось загрузить партнёрский кабинет</div>
                    <div className="mt-2 text-sm text-white/70">
                        Обнови страницу и попробуй ещё раз чуть позже.
                    </div>
                </div>
            )}

            {state === "success" && overview && (
                <PartnerConsole
                    overview={overview}
                    telegramBotUsername={TELEGRAM_BOT_USERNAME}
                />
            )}
        </AccountShell>
    );
}
