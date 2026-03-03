import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm, PasswordChangeForm } from "@/components/account/ProfileForms";
import { profileFixture } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ state?: string }>;
}) {
    const params = await searchParams;
    const state = (params.state ?? "success") as "success" | "loading" | "empty" | "error";

    return (
        <AccountShell
            title="Профиль"
            description="Данные и пароль"
            primaryAction={{ label: "Сохранить", href: "#profile" }}
            quickActions={quickActions}
        >
            <div className="grid items-stretch gap-8 lg:grid-cols-2">
                <div id="profile" className="h-full">
                    <ProfileForm profile={profileFixture} state={state} />
                </div>
                <div className="h-full">
                    <PasswordChangeForm state={state} />
                </div>
            </div>
        </AccountShell>
    );
}
