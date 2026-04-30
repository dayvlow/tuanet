import type { BackendAccount } from "@/lib/backend";
import { hasAccountPermission } from "@/lib/backend";

export type AdminSectionKey =
    | "stats"
    | "servers"
    | "messaging"
    | "partner-applications"
    | "partners"
    | "partner-rates"
    | "promos"
    | "payouts"
    | "moderators"
    | "notifications"
    | "errors";

export interface AdminSectionDefinition {
    key: AdminSectionKey;
    href: string;
    label: string;
    title: string;
    description: string;
}

export const STAFF_PERMISSION_VIEW_DASHBOARD_STATS = "admin.view_dashboard_stats";
export const STAFF_PERMISSION_VIEW_SERVER_METRICS = "admin.view_server_metrics";
export const STAFF_PERMISSION_VIEW_USER_COUNTS = "admin.view_user_counts";
export const STAFF_PERMISSION_VIEW_USER_LIST = "admin.view_user_list";
export const STAFF_PERMISSION_MANAGE_USER_BALANCE = "admin.manage_user_balance";
export const STAFF_PERMISSION_VIEW_PARTNER_LIST = "admin.view_partner_list";
export const STAFF_PERMISSION_MANAGE_PARTNER_STATUS = "admin.manage_partner_status";
export const STAFF_PERMISSION_VIEW_PARTNER_APPLICATIONS = "admin.view_partner_applications";
export const STAFF_PERMISSION_REVIEW_PARTNER_APPLICATIONS = "admin.review_partner_applications";
export const STAFF_PERMISSION_VIEW_PARTNER_PAYOUTS = "admin.view_partner_payouts";
export const STAFF_PERMISSION_MANAGE_PARTNER_PAYOUTS = "admin.manage_partner_payouts";
export const STAFF_PERMISSION_VIEW_NOTIFICATIONS = "admin.view_notifications";
export const STAFF_PERMISSION_VIEW_SYSTEM_ERRORS = "admin.view_system_errors";
export const STAFF_PERMISSION_MANAGE_MESSAGING = "admin.manage_messaging";

export const ADMIN_SECTIONS: AdminSectionDefinition[] = [
    {
        key: "stats",
        href: "/account/admin",
        label: "Статистика",
        title: "Статистика",
        description: "Графики, пользователи, балансы и сводка по системе",
    },
    {
        key: "servers",
        href: "/account/admin/servers",
        label: "Серверы",
        title: "Серверы",
        description: "Live-нагрузка площадок, онлайн, память и трафик по серверам",
    },
    {
        key: "messaging",
        href: "/account/admin/messaging",
        label: "Сообщения",
        title: "Сообщения",
        description: "Точечные сообщения и Telegram-рассылки пользователям, включая медиа",
    },
    {
        key: "partner-applications",
        href: "/account/admin/partner-applications",
        label: "Подключение партнёров",
        title: "Подключение партнёров",
        description: "Заявки на создание партнёрского кабинета и решения по ним",
    },
    {
        key: "partners",
        href: "/account/admin/partners",
        label: "Список партнёров",
        title: "Список партнёров",
        description: "Все партнёры, их активность, статусы и показатели",
    },
    {
        key: "partner-rates",
        href: "/account/admin/partner-rates",
        label: "Тарифы партнёров",
        title: "Тарифы партнёров",
        description: "Глобальные условия и индивидуальные проценты партнёров",
    },
    {
        key: "promos",
        href: "/account/admin/promos",
        label: "Промокоды",
        title: "Промокоды",
        description: "Балансные промокоды и бонусы на пополнение через ЮKassa",
    },
    {
        key: "payouts",
        href: "/account/admin/payouts",
        label: "Заявки на вывод",
        title: "Заявки на вывод",
        description: "Новые, исполненные и отклонённые заявки партнёров",
    },
    {
        key: "moderators",
        href: "/account/admin/moderators",
        label: "Модераторы",
        title: "Модераторы",
        description: "Создание moderka-аккаунтов, права доступа и управление командой",
    },
    {
        key: "notifications",
        href: "/account/admin/notifications",
        label: "Уведомления",
        title: "Уведомления",
        description: "Служебные сигналы о реферальных, партнёрских и системных событиях",
    },
    {
        key: "errors",
        href: "/account/admin/errors",
        label: "Ошибки",
        title: "Ошибки",
        description: "Журнал ошибок с кодами и контекстом для разбора",
    },
];

export function getAdminSection(key: AdminSectionKey): AdminSectionDefinition {
    return ADMIN_SECTIONS.find((section) => section.key === key) ?? ADMIN_SECTIONS[0];
}

export function getAdminSectionByHref(href: string): AdminSectionDefinition | undefined {
    return ADMIN_SECTIONS.find((section) => section.href === href);
}

function hasAnyStaffPermission(account: BackendAccount, permissions: string[]): boolean {
    return permissions.some((permission) => hasAccountPermission(account, permission));
}

export function canAccessAdminSection(account: BackendAccount | null, sectionKey: AdminSectionKey): boolean {
    if (!account || account.portal !== "staff") {
        return false;
    }

    if (account.roles.includes("admin")) {
        return true;
    }

    switch (sectionKey) {
        case "stats":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_DASHBOARD_STATS,
                STAFF_PERMISSION_VIEW_USER_COUNTS,
                STAFF_PERMISSION_VIEW_USER_LIST,
                STAFF_PERMISSION_MANAGE_USER_BALANCE,
            ]);
        case "servers":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_SERVER_METRICS,
            ]);
        case "messaging":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_MANAGE_MESSAGING,
            ]);
        case "partners":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_PARTNER_LIST,
                STAFF_PERMISSION_MANAGE_PARTNER_STATUS,
            ]);
        case "partner-applications":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_PARTNER_APPLICATIONS,
                STAFF_PERMISSION_REVIEW_PARTNER_APPLICATIONS,
            ]);
        case "payouts":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_PARTNER_PAYOUTS,
                STAFF_PERMISSION_MANAGE_PARTNER_PAYOUTS,
            ]);
        case "partner-rates":
        case "promos":
        case "moderators":
            return false;
        case "notifications":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_NOTIFICATIONS,
            ]);
        case "errors":
            return hasAnyStaffPermission(account, [
                STAFF_PERMISSION_VIEW_SYSTEM_ERRORS,
            ]);
    }
}

export function getAvailableAdminSections(account: BackendAccount | null): AdminSectionDefinition[] {
    return ADMIN_SECTIONS.filter((section) => canAccessAdminSection(account, section.key));
}

export function getPreferredAdminSection(account: BackendAccount | null): AdminSectionDefinition {
    return getAvailableAdminSections(account)[0] ?? getAdminSection("stats");
}
