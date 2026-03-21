import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm, PasswordChangeForm } from "@/components/account/ProfileForms";
import { profileFixture } from "@/lib/account-fixtures";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    let profile = profileFixture;

    if (isSupabaseConfigured()) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            profile = {
                ...profileFixture,
                name: user.user_metadata.full_name ?? user.user_metadata.name ?? profileFixture.name,
                email: user.email ?? profileFixture.email,
                emailVerified: Boolean(user.email_confirmed_at),
            };
        }
    }

    return (
        <AccountShell
            title="Профиль"
            description="Данные аккаунта и пароль"
            primaryAction={{ label: "Сохранить", href: "#profile" }}
            quickActions={quickActions}
        >
            <div className="grid items-stretch gap-8 lg:grid-cols-2">
                <div id="profile" className="h-full">
                    <ProfileForm profile={profile} state={state} />
                </div>
                <div className="h-full">
                    <PasswordChangeForm state={state} />
                </div>
            </div>
        </AccountShell>
    );
}
