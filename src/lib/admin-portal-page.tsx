import { AccountShell } from "@/components/account/AccountShell";
import { AdminConsole } from "@/components/account/AdminConsole";
import { redirect } from "next/navigation";
import {
    BackendAccount,
    BackendAdminMessagingOverview,
    BackendAdminOverview,
    BackendAdminPartnersResponse,
    BackendAdminPartnerApplicationsResponse,
    BackendAdminPartnerPayoutsResponse,
    BackendAdminPromocodeResponse,
    BackendAdminRoleResponse,
    BackendAdminServersResponse,
    BackendSecurityBlockCountersResponse,
    BackendStaffFeedResponse,
    BackendAdminUsersResponse,
    getAccountDisplayLabel,
    hasAccountPermission,
} from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import {
    AdminSectionKey,
    getAdminSection,
    getAvailableAdminSections,
    STAFF_PERMISSION_MANAGE_PARTNER_PAYOUTS,
    STAFF_PERMISSION_MANAGE_PARTNER_STATUS,
    STAFF_PERMISSION_MANAGE_USER_BALANCE,
    STAFF_PERMISSION_MANAGE_MESSAGING,
    STAFF_PERMISSION_REVIEW_PARTNER_APPLICATIONS,
    STAFF_PERMISSION_VIEW_NOTIFICATIONS,
    STAFF_PERMISSION_VIEW_DASHBOARD_STATS,
    STAFF_PERMISSION_VIEW_SERVER_METRICS,
    STAFF_PERMISSION_VIEW_PARTNER_APPLICATIONS,
    STAFF_PERMISSION_VIEW_PARTNER_LIST,
    STAFF_PERMISSION_VIEW_PARTNER_PAYOUTS,
    STAFF_PERMISSION_VIEW_SYSTEM_ERRORS,
    STAFF_PERMISSION_VIEW_USER_COUNTS,
    STAFF_PERMISSION_VIEW_USER_LIST,
} from "@/lib/admin-sections";
import { requireSessionAccount, rethrowNavigationSignal } from "@/lib/server-auth";

function buildAdminQuickActions(
    activeSection: AdminSectionKey,
    availableSections: ReturnType<typeof getAvailableAdminSections>,
) {
    const currentSection = availableSections.find((section) => section.key === activeSection) ?? getAdminSection(activeSection);
    const secondarySection = availableSections.find((section) => section.key !== currentSection.key);

    return [
        { label: currentSection.label, href: currentSection.href },
        ...(secondarySection ? [{ label: secondarySection.label, href: secondarySection.href }] : []),
        { label: "Профиль", href: "/account/profile" },
    ];
}

export async function renderAdminPortalPage(activeSection: AdminSectionKey) {
    const section = getAdminSection(activeSection);
    let token: string | null = null;

    let state: "success" | "error" | "forbidden" = "success";
    let loadWarning: string | null = null;
    let account: BackendAccount | null = null;
    let overview: BackendAdminOverview | null = null;
    let users: BackendAdminUsersResponse | null = null;
    let roles: BackendAdminRoleResponse | null = null;
    let servers: BackendAdminServersResponse | null = null;
    let messagingOverview: BackendAdminMessagingOverview | null = null;
    let partners: BackendAdminPartnersResponse | null = null;
    let partnerPayouts: BackendAdminPartnerPayoutsResponse | null = null;
    let partnerApplications: BackendAdminPartnerApplicationsResponse | null = null;
    let promos: BackendAdminPromocodeResponse | null = null;
    let notifications: BackendStaffFeedResponse | null = null;
    let notificationBlockCounters: BackendSecurityBlockCountersResponse | null = null;
    let systemErrors: BackendStaffFeedResponse | null = null;
    let availableSections = [] as ReturnType<typeof getAvailableAdminSections>;

    const setWarning = (message: string) => {
        loadWarning = loadWarning ? `${loadWarning}; ${message}` : message;
    };

    try {
        const session = await requireSessionAccount("staff");
        token = session.token;
        account = session.account;
    } catch (error) {
        rethrowNavigationSignal(error);
        state = "error";
    }

    const isAdmin = account?.roles.includes("admin") ?? false;
    const canViewDashboardStats = hasAccountPermission(account, STAFF_PERMISSION_VIEW_DASHBOARD_STATS);
    const canViewServerMetrics = hasAccountPermission(account, STAFF_PERMISSION_VIEW_SERVER_METRICS);
    const canViewUserCounts = hasAccountPermission(account, STAFF_PERMISSION_VIEW_USER_COUNTS);
    const canViewUserList = hasAccountPermission(account, STAFF_PERMISSION_VIEW_USER_LIST);
    const canManageUserBalance = hasAccountPermission(account, STAFF_PERMISSION_MANAGE_USER_BALANCE);
    const canViewPartnerList = hasAccountPermission(account, STAFF_PERMISSION_VIEW_PARTNER_LIST);
    const canManagePartnerStatus = hasAccountPermission(account, STAFF_PERMISSION_MANAGE_PARTNER_STATUS);
    const canViewPartnerApplications = hasAccountPermission(account, STAFF_PERMISSION_VIEW_PARTNER_APPLICATIONS);
    const canReviewPartnerApplications = hasAccountPermission(account, STAFF_PERMISSION_REVIEW_PARTNER_APPLICATIONS);
    const canViewPartnerPayouts = hasAccountPermission(account, STAFF_PERMISSION_VIEW_PARTNER_PAYOUTS);
    const canManagePartnerPayouts = hasAccountPermission(account, STAFF_PERMISSION_MANAGE_PARTNER_PAYOUTS);
    const canManageMessaging = hasAccountPermission(account, STAFF_PERMISSION_MANAGE_MESSAGING);
    const canViewNotifications = hasAccountPermission(account, STAFF_PERMISSION_VIEW_NOTIFICATIONS);
    const canViewSystemErrors = hasAccountPermission(account, STAFF_PERMISSION_VIEW_SYSTEM_ERRORS);

    if (state === "success" && account?.portal !== "staff") {
        state = "forbidden";
    }

    if (state === "success" && account) {
        availableSections = getAvailableAdminSections(account);
        if (availableSections.length > 0 && !availableSections.some((item) => item.key === activeSection)) {
            redirect(availableSections[0].href);
        }
    }

    if (state === "success" && account) {
        if (activeSection === "stats") {
            const [overviewResult, usersResult] = await Promise.allSettled([
                (canViewDashboardStats || canViewUserCounts)
                    ? fetchBackendJson<BackendAdminOverview>("/admin/overview", { token: token ?? undefined })
                    : Promise.resolve(null),
                canViewUserList
                    ? fetchBackendJson<BackendAdminUsersResponse>("/admin/users?limit=1000", { token: token ?? undefined })
                    : Promise.resolve(null),
            ]);

            if (overviewResult.status === "fulfilled") {
                overview = overviewResult.value;
            } else if (canViewDashboardStats || canViewUserCounts) {
                setWarning(overviewResult.reason instanceof Error ? overviewResult.reason.message : "Не удалось загрузить обзор админки");
            }

            if (usersResult.status === "fulfilled") {
                users = usersResult.value;
            } else if (canViewUserList) {
                setWarning(usersResult.reason instanceof Error ? usersResult.reason.message : "Не удалось загрузить список пользователей");
            }
        }

        if (activeSection === "servers" && canViewServerMetrics) {
            try {
                servers = await fetchBackendJson<BackendAdminServersResponse>("/admin/servers", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить live-метрики серверов");
            }
        }

        if (activeSection === "messaging" && canManageMessaging) {
            const [messagingResult, usersResult] = await Promise.allSettled([
                fetchBackendJson<BackendAdminMessagingOverview>("/admin/messaging", { token: token ?? undefined }),
                canViewUserList
                    ? fetchBackendJson<BackendAdminUsersResponse>("/admin/users?limit=1000", { token: token ?? undefined })
                    : Promise.resolve(null),
            ]);

            if (messagingResult.status === "fulfilled") {
                messagingOverview = messagingResult.value;
            } else {
                setWarning(messagingResult.reason instanceof Error ? messagingResult.reason.message : "Не удалось загрузить обзор отправок");
            }

            if (usersResult.status === "fulfilled") {
                users = usersResult.value;
            } else if (canViewUserList) {
                setWarning(usersResult.reason instanceof Error ? usersResult.reason.message : "Не удалось загрузить список получателей");
            }
        }

        if (activeSection === "moderators" && isAdmin) {
            try {
                roles = await fetchBackendJson<BackendAdminRoleResponse>("/admin/roles", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить роли и модераторов");
            }
        }

        if (activeSection === "partners" && (canViewPartnerList || canManagePartnerStatus)) {
            try {
                partners = await fetchBackendJson<BackendAdminPartnersResponse>("/admin/partners?limit=100", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить список партнёров");
            }
        }

        if (activeSection === "partner-rates" && isAdmin) {
            try {
                const [settingsOverview, partnersResponse] = await Promise.all([
                    fetchBackendJson<BackendAdminOverview>("/admin/overview", { token: token ?? undefined }),
                    fetchBackendJson<BackendAdminPartnersResponse>("/admin/partners?limit=100", { token: token ?? undefined }),
                ]);
                overview = settingsOverview;
                partners = partnersResponse;
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить тарифы партнёров");
            }
        }

        if (activeSection === "promos" && isAdmin) {
            try {
                promos = await fetchBackendJson<BackendAdminPromocodeResponse>("/admin/promocodes", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить промокоды");
            }
        }

        if (activeSection === "payouts" && (canViewPartnerPayouts || canManagePartnerPayouts)) {
            try {
                partnerPayouts = await fetchBackendJson<BackendAdminPartnerPayoutsResponse>("/admin/partner-payouts?limit=100", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить заявки на вывод");
            }
        }

        if (activeSection === "partner-applications" && (canViewPartnerApplications || canReviewPartnerApplications)) {
            try {
                partnerApplications = await fetchBackendJson<BackendAdminPartnerApplicationsResponse>("/admin/partner-applications?limit=100", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить заявки на партнёрку");
            }
        }

        if (activeSection === "notifications" && canViewNotifications) {
            try {
                notifications = await fetchBackendJson<BackendStaffFeedResponse>("/admin/notifications?limit=100", { token: token ?? undefined });
                if (isAdmin) {
                    notificationBlockCounters = await fetchBackendJson<BackendSecurityBlockCountersResponse>(
                        "/admin/notifications/block-counters",
                        { token: token ?? undefined },
                    );
                }
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить уведомления");
            }
        }

        if (activeSection === "errors" && canViewSystemErrors) {
            try {
                systemErrors = await fetchBackendJson<BackendStaffFeedResponse>("/admin/system-errors?limit=100", { token: token ?? undefined });
            } catch (error) {
                setWarning(error instanceof Error ? error.message : "Не удалось загрузить ошибки");
            }
        }
    }

    const accountLabel = account ? getAccountDisplayLabel(account) : undefined;

    return (
        <AccountShell
            title={section.title}
            description={section.description}
            quickActions={buildAdminQuickActions(activeSection, availableSections)}
            accountLabel={accountLabel}
            portal={account?.portal ?? "staff"}
            staffSectionKeys={availableSections.map((item) => item.key)}
        >
            {loadWarning && state === "success" && (
                <div className="rounded-[32px] border-2 border-amber-500/30 bg-amber-500/10 p-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-normal text-amber-200">Часть данных недоступна</div>
                    <div className="mt-3 text-sm text-white/75">
                        {loadWarning}
                    </div>
                </div>
            )}

            {state === "forbidden" && (
                <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-8 text-white">
                    <div className="text-xs font-bold uppercase tracking-normal text-red-300">Доступ закрыт</div>
                    <div className="mt-4 text-3xl font-black uppercase tracking-tight">Нужна отдельная staff-учётка</div>
                    <div className="mt-2 text-sm text-white/70">
                        Админка и moderka теперь работают через отдельные аккаунты с ролями `admin` или `moderator`.
                    </div>
                </div>
            )}

            {state === "error" && (
                <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/10 p-8 text-white">
                    <div className="text-xs font-bold uppercase tracking-normal text-red-300">Ошибка</div>
                    <div className="mt-4 text-3xl font-black uppercase tracking-tight">Не удалось загрузить админку</div>
                    <div className="mt-2 text-sm text-white/70">
                        Проверь backend и обнови страницу.
                    </div>
                </div>
            )}

            {state === "success" && account && (
                <AdminConsole
                    activeSection={activeSection}
                    overview={overview}
                    users={users?.users ?? []}
                    roleAccounts={roles?.accounts ?? []}
                    permissionCatalog={roles?.permission_catalog ?? account.permission_catalog}
                    serverMetrics={servers}
                    messagingOverview={messagingOverview}
                    partners={partners?.partners ?? []}
                    partnerPayoutRequests={partnerPayouts?.requests ?? []}
                    partnerApplications={partnerApplications?.applications ?? []}
                    promocodes={promos?.promocodes ?? []}
                    isAdmin={isAdmin}
                    canViewDashboardStats={canViewDashboardStats}
                    canViewServerMetrics={canViewServerMetrics}
                    canViewUserCounts={canViewUserCounts}
                    canViewUserList={canViewUserList}
                    canManageUserBalance={canManageUserBalance}
                    canViewPartnerList={canViewPartnerList}
                    canManagePartnerStatus={canManagePartnerStatus}
                    canViewPartnerApplications={canViewPartnerApplications}
                    canReviewPartnerApplications={canReviewPartnerApplications}
                    canViewPartnerPayouts={canViewPartnerPayouts}
                    canManagePartnerPayouts={canManagePartnerPayouts}
                    canManageMessaging={canManageMessaging}
                    notifications={notifications?.items ?? []}
                    notificationBlockCounters={notificationBlockCounters?.counters ?? null}
                    systemErrors={systemErrors?.items ?? []}
                    canViewNotifications={canViewNotifications}
                    canViewSystemErrors={canViewSystemErrors}
                />
            )}
        </AccountShell>
    );
}
