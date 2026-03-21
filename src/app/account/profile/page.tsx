import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm, PasswordChangeForm } from "@/components/account/ProfileForms";
import { getAccountData } from "@/lib/supabase/account";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Безопасность", href: "/account/security" },
    { label: "Профиль", href: "/account/profile" },
];

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const data = await getAccountData();
    const forcedState = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    const state = forcedState === "success" && data.errors.profile ? "error" : forcedState;

    return (
        <AccountShell
            title="Профиль"
            description="Данные аккаунта и пароль"
            primaryAction={{ label: "Сохранить", href: "#profile" }}
            quickActions={quickActions}
        >
            <div className="grid items-stretch gap-8 lg:grid-cols-2">
                <div id="profile" className="h-full">
                    <ProfileForm profile={data.profile} state={state} />
                </div>
                <div className="h-full">
                    <PasswordChangeForm state={state} />
                </div>
            </div>
        </AccountShell>
    );
}
