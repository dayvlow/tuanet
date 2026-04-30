import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm, PasswordChangeForm } from "@/components/account/ProfileForms";
import { TelegramLinkCard } from "@/components/account/TelegramLinkCard";
import {
    BackendAccount,
    buildProfileInfo,
    getAccountDisplayLabel,
    getTelegramIdentity,
} from "@/lib/backend";
import { getAvailableAdminSections } from "@/lib/admin-sections";
import { normalizePortalParam } from "@/lib/session-portal";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

const customerQuickActions = [
    { label: "Платежи", href: "/account/payments" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Профиль", href: "/account/profile" },
];

interface ProfilePageProps {
    searchParams?: Promise<{
        portal?: string;
    }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
    const params = searchParams ? await searchParams : undefined;
    const portalHint = normalizePortalParam(params?.portal);

    let state: "success" | "loading" | "empty" | "error" = "success";
    let account: BackendAccount | null = null;

    try {
        const session = await requireSessionAccount(portalHint);
        account = session.account;
    } catch (error) {
        rethrowNavigationSignal(error);
        state = "error";
    }

    const profile = account ? buildProfileInfo(account) : {
        name: "",
        birthDate: "",
        email: "",
        emailVerified: false,
    };
    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;
    const telegramIdentity = account ? getTelegramIdentity(account) : undefined;
    const emailIdentity = account?.identities.find((identity) => identity.provider === "email");
    const resolvedPortal = account?.portal ?? portalHint ?? undefined;
    const showTelegramLinkCard = resolvedPortal !== "staff" && resolvedPortal !== "partner";
    const availableAdminSections = account?.portal === "staff"
        ? getAvailableAdminSections(account)
        : [];
    const quickActions = account?.portal === "staff"
        ? [
            ...availableAdminSections.slice(0, 2).map((section) => ({
                label: section.label,
                href: section.href,
            })),
            { label: "Профиль", href: "/account/profile" },
        ]
        : account?.portal === "partner"
            ? [
                { label: "Партнёрка", href: "/account/partner" },
                { label: "Профиль", href: "/account/profile" },
            ]
            : customerQuickActions;

    return (
        <AccountShell
            title="Профиль"
            description={showTelegramLinkCard ? "Email, пароль и привязки" : "Email и пароль"}
            quickActions={quickActions}
            accountLabel={accountLabel}
            portal={account?.portal}
            staffSectionKeys={availableAdminSections.map((section) => section.key)}
        >
            <div className="grid gap-8">
                <div className="grid items-stretch gap-8 lg:grid-cols-2">
                    <div id="profile" className="h-full">
                        <ProfileForm
                            profile={profile}
                            state={state}
                            portal={resolvedPortal}
                            accountId={account?.account_id}
                        />
                    </div>
                    <div className="h-full">
                        <PasswordChangeForm
                            state={state}
                            hasEmail={Boolean(emailIdentity?.email)}
                            hasPassword={Boolean(emailIdentity?.has_password)}
                            portal={resolvedPortal}
                        />
                    </div>
                </div>

                {showTelegramLinkCard && (
                    <TelegramLinkCard
                        telegramExternalId={telegramIdentity?.external_id}
                        telegramUsername={telegramIdentity?.external_username}
                        portal={resolvedPortal}
                    />
                )}
            </div>
        </AccountShell>
    );
}
