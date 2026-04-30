"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
    BackendAdminConnectionProfile,
    BackendAdminMessagingActionResponse,
    BackendAdminMessagingOverview,
    BackendAdminOverview,
    BackendAdminPartner,
    BackendAdminPartnerPayout,
    BackendAdminServer,
    BackendAdminServersResponse,
    BackendSecurityBlockCounters,
    BackendAdminSetting,
    BackendAdminUser,
    BackendAdminUserDetail,
    BackendPartnerApplication,
    BackendPromo,
    BackendStaffFeedItem,
    BackendStaffPermissionDefinition,
} from "@/lib/backend";
import type { AdminSectionKey } from "@/lib/admin-sections";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminConsoleProps {
    activeSection: AdminSectionKey;
    overview: BackendAdminOverview | null;
    serverMetrics: BackendAdminServersResponse | null;
    messagingOverview: BackendAdminMessagingOverview | null;
    users: BackendAdminUser[];
    roleAccounts: BackendAdminUser[];
    permissionCatalog: BackendStaffPermissionDefinition[];
    partners: BackendAdminPartner[];
    partnerPayoutRequests: BackendAdminPartnerPayout[];
    partnerApplications: BackendPartnerApplication[];
    promocodes: BackendPromo[];
    isAdmin: boolean;
    canViewDashboardStats: boolean;
    canViewServerMetrics: boolean;
    canViewUserCounts: boolean;
    canViewUserList: boolean;
    canManageUserBalance: boolean;
    canViewPartnerList: boolean;
    canManagePartnerStatus: boolean;
    canViewPartnerApplications: boolean;
    canReviewPartnerApplications: boolean;
    canViewPartnerPayouts: boolean;
    canManagePartnerPayouts: boolean;
    canManageMessaging: boolean;
    notifications: BackendStaffFeedItem[];
    notificationBlockCounters: BackendSecurityBlockCounters | null;
    systemErrors: BackendStaffFeedItem[];
    canViewNotifications: boolean;
    canViewSystemErrors: boolean;
}

const editableSettingKeys = [
    "TARIFF_PER_DEVICE",
    "REF_LVL1_PERCENT",
    "REF_LVL2_PERCENT",
    "PARTNER_DEFAULT_LVL1_PERCENT",
    "PARTNER_DEFAULT_LVL2_PERCENT",
    "PROMO100_ENABLED",
    "PROMO100_START",
    "PROMO100_END",
];

const partnerRateSettingKeys = [
    "TARIFF_PER_DEVICE",
    "REF_LVL1_PERCENT",
    "REF_LVL2_PERCENT",
    "PARTNER_DEFAULT_LVL1_PERCENT",
    "PARTNER_DEFAULT_LVL2_PERCENT",
];

type BalanceMode = "add" | "set" | "reset";

const PROTOCOL_OPTIONS = [
    { id: "tcp_reality", label: "TCP Reality" },
    { id: "tcp_tls", label: "TCP TLS" },
    { id: "xhttp_tls", label: "XHTTP TLS" },
] as const;

type ConnectionProtocol = typeof PROTOCOL_OPTIONS[number]["id"];
const FIXED_SALE_PROFILE_CODES = ["fi", "nl", "de", "fi-msk", "nl-msk", "de-msk"] as const;

function normalizeProtocolSelection(
    availableProtocols: string[] | null | undefined,
    defaultProtocol: string | null | undefined,
): { available: ConnectionProtocol[]; defaultProtocol: ConnectionProtocol | null } {
    const allowed = new Set<string>(PROTOCOL_OPTIONS.map((item) => item.id));
    const seen = new Set<string>();
    const available = (availableProtocols ?? [])
        .map((item) => item.trim())
        .filter((item): item is ConnectionProtocol => Boolean(item) && allowed.has(item) && !seen.has(item) && (seen.add(item), true));
    const tcpDefault = available.find((item) => item === "tcp_reality" || item === "tcp_tls") ?? available[0] ?? null;
    const normalizedDefault = defaultProtocol && available.includes(defaultProtocol as ConnectionProtocol)
        ? defaultProtocol as ConnectionProtocol
        : tcpDefault;
    return { available, defaultProtocol: normalizedDefault };
}

function toggleProtocolInList(current: string[], protocolId: ConnectionProtocol, checked: boolean): string[] {
    if (checked) {
        return normalizeProtocolSelection([...current, protocolId], null).available;
    }
    return current.filter((item) => item !== protocolId);
}

function formatProtocolList(protocols: string[] | null | undefined, defaultProtocol?: string | null): string {
    const normalized = normalizeProtocolSelection(protocols, defaultProtocol);
    if (!normalized.available.length) {
        return "Не задано";
    }

    return normalized.available.map((protocol) => {
        const label = PROTOCOL_OPTIONS.find((item) => item.id === protocol)?.label ?? protocol;
        return normalized.defaultProtocol === protocol ? `${label} (default)` : label;
    }).join(", ");
}

function formatMoney(value: number): string {
    return `${value.toFixed(2)} ₽`;
}

function formatTrafficBytes(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "Нет данных";
    }

    const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
    let normalized = Math.max(value, 0);
    let unitIndex = 0;

    while (normalized >= 1024 && unitIndex < units.length - 1) {
        normalized /= 1024;
        unitIndex += 1;
    }

    const digits = unitIndex === 0 ? 0 : normalized >= 100 ? 0 : normalized >= 10 ? 1 : 2;
    return `${normalized.toFixed(digits)} ${units[unitIndex]}`;
}

function formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "Нет данных";
    }
    return `${value.toFixed(1)}%`;
}

function formatBandwidthSpeed(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "Нет данных";
    }

    const units = ["Б/с", "КБ/с", "МБ/с", "ГБ/с"];
    let normalized = Math.max(value, 0);
    let unitIndex = 0;
    while (normalized >= 1024 && unitIndex < units.length - 1) {
        normalized /= 1024;
        unitIndex += 1;
    }

    const digits = unitIndex === 0 ? 0 : normalized >= 100 ? 0 : normalized >= 10 ? 1 : 2;
    return `${normalized.toFixed(digits)} ${units[unitIndex]}`;
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return "Нет данных";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Нет данных";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function toDateTimeLocalValue(value: string | null | undefined): string {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function buildInitialSettings(settings?: Record<string, BackendAdminSetting>): Record<string, string> {
    const result: Record<string, string> = {};
    if (!settings) {
        return result;
    }

    for (const key of editableSettingKeys) {
        const setting = settings[key];
        if (!setting) {
            continue;
        }
        result[key] = String(setting.value);
    }

    return result;
}

function formatAdminIdentityLine(user: BackendAdminUser): string {
    const parts: string[] = [];

    if (user.email) {
        parts.push(`Сайт: ${user.email}`);
    }

    if (user.telegram_id) {
        const username = user.telegram_username ? ` @${user.telegram_username}` : "";
        parts.push(`Telegram: ${user.telegram_id}${username}`);
    }

    return parts.join(" • ") || "Без внешних привязок";
}

function getLinkStateTone(linkState: BackendAdminUser["link_state"]): string {
    switch (linkState) {
        case "linked":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
        case "telegram_only":
            return "border-sky-500/25 bg-sky-500/10 text-sky-200";
        case "site_only":
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
        default:
            return "border-white/15 bg-white/5 text-white/60";
    }
}

function getApplicationStatusLabel(status: string): string {
    switch (status) {
        case "approved":
            return "Одобрена";
        case "rejected":
            return "Отклонена";
        default:
            return "Новая";
    }
}

function getApplicationStatusTone(status: string): string {
    switch (status) {
        case "approved":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
        case "rejected":
            return "border-red-500/25 bg-red-500/10 text-red-200";
        default:
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
    }
}

function getPayoutStatusLabel(status: string): string {
    switch (status) {
        case "approved":
            return "Одобрена";
        case "paid":
            return "Оплачена";
        case "rejected":
            return "Отклонена";
        default:
            return "Новая";
    }
}

function getPayoutStatusTone(status: string): string {
    switch (status) {
        case "approved":
            return "border-sky-500/25 bg-sky-500/10 text-sky-200";
        case "paid":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
        case "rejected":
            return "border-red-500/25 bg-red-500/10 text-red-200";
        default:
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
    }
}

function getFeedTone(kind: BackendStaffFeedItem["kind"]): string {
    return kind === "error"
        ? "border-red-500/25 bg-red-500/10 text-red-200"
        : "border-sky-500/25 bg-sky-500/10 text-sky-200";
}

function getPaymentStatusLabel(status: string): string {
    switch (status) {
        case "succeeded":
            return "Оплачен";
        case "pending":
            return "Ожидает";
        case "canceled":
            return "Отменён";
        default:
            return status || "Неизвестно";
    }
}

function getPaymentStatusTone(status: string): string {
    switch (status) {
        case "succeeded":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
        case "pending":
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
        case "canceled":
            return "border-red-500/25 bg-red-500/10 text-red-200";
        default:
            return "border-white/15 bg-white/5 text-white/60";
    }
}

function getServerLoadTone(level: BackendAdminServer["load_level"]): string {
    switch (level) {
        case "high":
            return "border-red-500/25 bg-red-500/10 text-red-200";
        case "medium":
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
        case "low":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
        default:
            return "border-white/15 bg-white/5 text-white/60";
    }
}

function buildTelegramProfileHref(user: Pick<BackendAdminUser, "telegram_username">): string | null {
    if (user.telegram_username) {
        return `https://t.me/${user.telegram_username}`;
    }

    return null;
}

function getDirectMessageTargetValue(user: BackendAdminUser): string {
    if (user.public_id) {
        return user.public_id;
    }
    if (user.telegram_id) {
        return `tg:${user.telegram_id}`;
    }
    if (user.legacy_telegram_user_id) {
        return `tg:${user.legacy_telegram_user_id}`;
    }
    return String(user.account_id);
}

function getDeviceAccessTone(device: BackendAdminUserDetail["devices"][number]): string {
    if (device.limited || device.marzban_status === "disabled") {
        return "border-amber-500/25 bg-amber-500/10 text-amber-100";
    }

    if (device.marzban_status === "active" || device.is_active) {
        return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
    }

    return "border-white/15 bg-white/5 text-white/60";
}

function getDeviceAccessLabel(device: BackendAdminUserDetail["devices"][number]): string {
    if (device.limited || device.marzban_status === "disabled") {
        return "Ограничен";
    }

    if (device.marzban_status === "active") {
        return "Доступен";
    }

    return device.is_active ? "Включён" : "Выключен";
}

function getDeviceLiveTone(device: BackendAdminUserDetail["devices"][number]): string {
    if (device.is_online === true) {
        return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
    }

    if (device.is_online === false) {
        return "border-white/15 bg-white/5 text-white/60";
    }

    return "border-sky-500/25 bg-sky-500/10 text-sky-200";
}

function getDeviceLiveLabel(device: BackendAdminUserDetail["devices"][number]): string {
    if (device.is_online === true) {
        return "Онлайн сейчас";
    }

    if (device.is_online === false) {
        return "Не в сети";
    }

    return "Нет live-данных";
}

function getMarzbanStatusLabel(status: string | null): string {
    switch (status) {
        case "active":
            return "Активен";
        case "disabled":
            return "Отключён";
        default:
            return status || "нет данных";
    }
}

function generateStrongPassword(groups = 4, groupLength = 4): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%";
    const all = upper + lower + digits + symbols;

    const randomChar = (alphabet: string) => alphabet[Math.floor(Math.random() * alphabet.length)];

    const chunks = Array.from({ length: groups }, () => {
        const chars = [
            randomChar(upper),
            randomChar(lower),
            randomChar(digits),
            randomChar(symbols),
        ];
        while (chars.length < groupLength) {
            chars.push(randomChar(all));
        }
        return chars.sort(() => Math.random() - 0.5).join("");
    });

    return chunks.join("-");
}

export function AdminConsole({
    activeSection,
    overview,
    serverMetrics,
    messagingOverview,
    users,
    roleAccounts,
    permissionCatalog,
    partners,
    partnerPayoutRequests,
    partnerApplications,
    promocodes,
    isAdmin,
    canViewDashboardStats,
    canViewServerMetrics,
    canViewUserCounts,
    canViewUserList,
    canManageUserBalance,
    canViewPartnerList,
    canManagePartnerStatus,
    canViewPartnerApplications,
    canReviewPartnerApplications,
    canViewPartnerPayouts,
    canManagePartnerPayouts,
    canManageMessaging,
    notifications,
    notificationBlockCounters,
    systemErrors,
    canViewNotifications,
    canViewSystemErrors,
}: AdminConsoleProps) {
    const router = useRouter();
    const [liveServerMetrics, setLiveServerMetrics] = useState<BackendAdminServersResponse | null>(serverMetrics);
    const [settingsValues, setSettingsValues] = useState<Record<string, string>>(() => buildInitialSettings(overview?.settings));
    const [balanceAccountId, setBalanceAccountId] = useState("");
    const [balanceMode, setBalanceMode] = useState<BalanceMode>("add");
    const [balanceAmount, setBalanceAmount] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createDisplayName, setCreateDisplayName] = useState("");
    const [createPermissions, setCreatePermissions] = useState<string[]>(
        () => permissionCatalog.map((permission) => permission.key)
    );
    const [partnerAccountId, setPartnerAccountId] = useState("");
    const [partnerLevel1Percent, setPartnerLevel1Percent] = useState("");
    const [partnerLevel2Percent, setPartnerLevel2Percent] = useState("");
    const [partnerDisplayName, setPartnerDisplayName] = useState("");
    const [partnerPayoutDetails, setPartnerPayoutDetails] = useState("");
    const [partnerIsActive, setPartnerIsActive] = useState("true");
    const [applicationReviewNotes, setApplicationReviewNotes] = useState<Record<number, string>>({});
    const [directMessageTarget, setDirectMessageTarget] = useState("");
    const [directMessageText, setDirectMessageText] = useState("");
    const [directMessageFile, setDirectMessageFile] = useState<File | null>(null);
    const [broadcastText, setBroadcastText] = useState("");
    const [broadcastFile, setBroadcastFile] = useState<File | null>(null);
    const [promoCode, setPromoCode] = useState("");
    const [promoType, setPromoType] = useState<BackendPromo["promo_type"]>("topup_bonus");
    const [promoBonus, setPromoBonus] = useState("");
    const [promoMinAmount, setPromoMinAmount] = useState("");
    const [promoMaxAmount, setPromoMaxAmount] = useState("");
    const [promoMaxBonusAmount, setPromoMaxBonusAmount] = useState("");
    const [promoActivationLimit, setPromoActivationLimit] = useState("");
    const [promoStartDate, setPromoStartDate] = useState("");
    const [promoEndDate, setPromoEndDate] = useState("");
    const [promoIsActive, setPromoIsActive] = useState(true);
    const [editingPromoCode, setEditingPromoCode] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [payoutView, setPayoutView] = useState<"active" | "history">("active");
    const [selectedUserAccountId, setSelectedUserAccountId] = useState<number | null>(null);
    const [selectedUserDetail, setSelectedUserDetail] = useState<BackendAdminUserDetail | null>(null);
    const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
    const [serverForm, setServerForm] = useState({
        code: "",
        name: "",
        public_name: "",
        flag: "",
        provider: "manual",
        host: "",
        key_name_template: "{flag}{public_name} ({username}) [VLESS - tcp]",
        reality_public_key: "",
        reality_short_id: "",
        reality_sni: "",
        reality_port: "",
        tls_sni: "",
        tls_port: "",
        xhttp_host: "",
        xhttp_path: "/",
        xhttp_port: "",
        available_protocols: ["tcp_reality"],
        default_protocol: "tcp_reality",
        sort_order: "500",
        is_visible_in_catalog: false,
        supports_auto_provision: false,
        enabled: true,
        notes: "",
    });
    const [profileForm, setProfileForm] = useState({
        code: "",
        name: "",
        public_name: "",
        flag: "",
        mode: "direct",
        entry_server_code: "",
        exit_server_code: "",
        managed_server_code: "",
        key_name_template: "{flag}{public_name} ({username}) [VLESS - tcp]",
        endpoint_host: "",
        reality_public_key: "",
        reality_short_id: "",
        reality_sni: "",
        reality_port: "",
        tls_sni: "",
        tls_port: "",
        xhttp_host: "",
        xhttp_path: "/",
        xhttp_port: "",
        available_protocols: ["tcp_reality"],
        default_protocol: "tcp_reality",
        sort_order: "500",
        is_visible_in_catalog: true,
        supports_auto_provision: false,
        enabled: true,
        notes: "",
    });
    const [saleNameDrafts, setSaleNameDrafts] = useState<Record<string, string>>({});

    const sortedUsers = useMemo(
        () => [...users].sort((left, right) => right.account_id - left.account_id),
        [users]
    );
    const messageableUsers = useMemo(
        () => sortedUsers.filter((user) => Boolean(user.telegram_id || user.legacy_telegram_user_id)),
        [sortedUsers]
    );
    const sortedPartners = useMemo(
        () => [...partners].sort((left, right) => right.account_id - left.account_id),
        [partners]
    );
    const selectedPartner = useMemo(() => {
        const accountId = Number(partnerAccountId);
        if (!Number.isFinite(accountId) || accountId <= 0) {
            return null;
        }
        return sortedPartners.find((partner) => partner.account_id === accountId) ?? null;
    }, [partnerAccountId, sortedPartners]);
    const adminAccounts = useMemo(
        () => roleAccounts.filter((account) => account.roles.includes("admin")),
        [roleAccounts]
    );
    const moderatorAccounts = useMemo(
        () => roleAccounts.filter((account) => account.roles.includes("moderator")),
        [roleAccounts]
    );
    const sortedPartnerApplications = useMemo(
        () => [...partnerApplications].sort((left, right) => right.id - left.id),
        [partnerApplications]
    );
    const pendingPartnerApplications = useMemo(
        () => sortedPartnerApplications.filter((application) => application.status === "pending"),
        [sortedPartnerApplications]
    );
    const approvedPartnerApplications = useMemo(
        () => sortedPartnerApplications.filter((application) => application.status === "approved"),
        [sortedPartnerApplications]
    );
    const rejectedPartnerApplications = useMemo(
        () => sortedPartnerApplications.filter((application) => application.status === "rejected"),
        [sortedPartnerApplications]
    );
    const reviewedPartnerApplications = useMemo(
        () => sortedPartnerApplications.filter((application) => application.status !== "pending"),
        [sortedPartnerApplications]
    );
    const openPayoutRequests = useMemo(
        () => partnerPayoutRequests.filter((request) => request.status === "pending" || request.status === "approved"),
        [partnerPayoutRequests]
    );
    const closedPayoutRequests = useMemo(
        () => partnerPayoutRequests.filter((request) => request.status !== "pending" && request.status !== "approved"),
        [partnerPayoutRequests]
    );
    const visiblePayoutRequests = payoutView === "active" ? openPayoutRequests : closedPayoutRequests;
    const activePartners = useMemo(
        () => sortedPartners.filter((partner) => partner.is_active),
        [sortedPartners]
    );
    const totalPartnerLinks = useMemo(
        () => sortedPartners.reduce((sum, partner) => sum + partner.links_total, 0),
        [sortedPartners]
    );
    const totalPartnerAvailable = useMemo(
        () => sortedPartners.reduce((sum, partner) => sum + partner.available_commission, 0),
        [sortedPartners]
    );
    const totalPartnerPendingPayouts = useMemo(
        () => sortedPartners.reduce((sum, partner) => sum + partner.pending_payout_total, 0),
        [sortedPartners]
    );
    const activePayoutTotal = useMemo(
        () => openPayoutRequests.reduce((sum, request) => sum + request.amount, 0),
        [openPayoutRequests]
    );
    const historyPayoutTotal = useMemo(
        () => closedPayoutRequests.reduce((sum, request) => sum + request.amount, 0),
        [closedPayoutRequests]
    );
    const recentAccounts = overview?.recent_accounts ?? [];
    const servers = liveServerMetrics?.servers ?? [];
    const profiles = liveServerMetrics?.profiles ?? [];
    const saleProfiles = useMemo(
        () => FIXED_SALE_PROFILE_CODES
            .map((code) => profiles.find((profile) => profile.code === code) ?? null)
            .filter((profile): profile is BackendAdminConnectionProfile => profile !== null),
        [profiles]
    );

    useEffect(() => {
        if (saleProfiles.length === 0) {
            return;
        }

        setSaleNameDrafts((current) => {
            const next = { ...current };
            let changed = false;
            for (const profile of saleProfiles) {
                if (typeof next[profile.code] === "string") {
                    continue;
                }
                next[profile.code] = profile.public_name ?? profile.client_label ?? profile.name;
                changed = true;
            }
            return changed ? next : current;
        });
    }, [saleProfiles]);

    const isStatsSection = activeSection === "stats";
    const isServersSection = activeSection === "servers";
    const isMessagingSection = activeSection === "messaging";
    const isPartnerApplicationsSection = activeSection === "partner-applications";
    const isPartnersSection = activeSection === "partners";
    const isPartnerRatesSection = activeSection === "partner-rates";
    const isPromosSection = activeSection === "promos";
    const isPayoutsSection = activeSection === "payouts";
    const isModeratorsSection = activeSection === "moderators";
    const isNotificationsSection = activeSection === "notifications";
    const isErrorsSection = activeSection === "errors";
    const canAccessStatsSection = canViewDashboardStats || canViewUserCounts || canViewUserList || canManageUserBalance;
    const canAccessServersSection = canViewServerMetrics;
    const canManageServersSection = isAdmin;
    const canAccessMessagingSection = canManageMessaging;
    const canAccessPartnersSection = canViewPartnerList || canManagePartnerStatus;
    const canAccessPartnerApplicationsSection = canViewPartnerApplications || canReviewPartnerApplications;
    const canAccessPayoutsSection = canViewPartnerPayouts || canManagePartnerPayouts;

    useEffect(() => {
        setLiveServerMetrics(serverMetrics);
    }, [serverMetrics]);

    async function refreshServerMetricsSnapshot(): Promise<BackendAdminServersResponse | null> {
        try {
            const response = await fetch("/api/admin/servers", {
                cache: "no-store",
            });
            const data = (await response.json().catch(() => null)) as BackendAdminServersResponse | { detail?: string } | null;
            if (!response.ok || !data || !("servers" in data)) {
                return null;
            }
            setLiveServerMetrics(data);
            return data;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        if (!serverForm.code && !serverForm.name && servers.length > 0) {
            const nextSortOrder = Math.max(...servers.map((server) => Number(server.sort_order ?? 0)), 0) + 100;
            setServerForm((current) => ({ ...current, sort_order: String(nextSortOrder) }));
        }
        if (!profileForm.entry_server_code && servers.length > 0) {
            const firstServerCode = servers[0]?.code ?? "";
            const nextSortOrder = Math.max(...profiles.map((profile) => Number(profile.sort_order ?? 0)), 0) + 100;
            setProfileForm((current) => ({
                ...current,
                entry_server_code: current.entry_server_code || firstServerCode,
                exit_server_code: current.exit_server_code || firstServerCode,
                managed_server_code: current.managed_server_code || firstServerCode,
                sort_order: current.sort_order || String(nextSortOrder),
            }));
        }
    }, [profileForm.entry_server_code, profileForm.sort_order, profiles, serverForm.code, serverForm.name, servers]);

    useEffect(() => {
        if (!isServersSection || !canViewServerMetrics) {
            return;
        }

        let isCancelled = false;

        const refreshServerMetrics = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                return;
            }

            const data = await refreshServerMetricsSnapshot();
            if (!data || isCancelled) {
                // Keep the last successful snapshot to avoid noisy UI flicker.
                return;
            }
        };

        void refreshServerMetrics();
        const timer = window.setInterval(() => {
            void refreshServerMetrics();
        }, 15000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void refreshServerMetrics();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            isCancelled = true;
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [isServersSection, canViewServerMetrics]);

    function resolveAccountReference(rawReference: string): BackendAdminUser | null {
        const normalized = rawReference.trim();
        if (!normalized) {
            return null;
        }

        const normalizedUpper = normalized.toUpperCase();
        const normalizedLower = normalized.toLowerCase();
        const numericReference = Number(normalized);
        if (normalizedLower.startsWith("tg:")) {
            const telegramReference = normalized.slice(3).trim();
            return (
                sortedUsers.find((user) => user.telegram_id === telegramReference)
                ?? sortedUsers.find((user) => String(user.legacy_telegram_user_id ?? "") === telegramReference)
                ?? null
            );
        }

        return (
            sortedUsers.find((user) => user.public_id === normalizedUpper)
            ?? (Number.isFinite(numericReference) && numericReference > 0
                ? sortedUsers.find((user) => user.account_id === numericReference)
                : null)
            ?? sortedUsers.find((user) => user.telegram_id === normalized)
            ?? (Number.isFinite(numericReference) && numericReference > 0
                ? sortedUsers.find((user) => user.legacy_telegram_user_id === numericReference)
                : null)
            ?? null
        );
    }

    async function loadUserDetail(user: BackendAdminUser) {
        const accountRef = getDirectMessageTargetValue(user);
        setSelectedUserAccountId(user.account_id);
        setIsUserDetailLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/users/${encodeURIComponent(accountRef)}`);
            const data = (await response.json().catch(() => ({}))) as BackendAdminUserDetail & { detail?: string };
            if (!response.ok) {
                throw new Error(data.detail ?? "Не удалось загрузить карточку пользователя");
            }

            setSelectedUserDetail(data);
        } catch (requestError) {
            setSelectedUserDetail(null);
            setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить карточку пользователя");
        } finally {
            setIsUserDetailLoading(false);
        }
    }

    function fillBalanceTarget(user: BackendAdminUser) {
        const accountReference = user.public_id ?? user.telegram_id ?? String(user.account_id);
        setBalanceAccountId(accountReference);
        setMessage(`${accountReference} подставлен в форму баланса.`);
        setError(null);
    }

    function fillDirectMessageTarget(user: BackendAdminUser) {
        const accountReference = getDirectMessageTargetValue(user);
        setDirectMessageTarget(accountReference);
        setMessage(`${accountReference} подставлен в отправку сообщения.`);
        setError(null);
    }

    function copyAdminValue(label: string, value: string | null | undefined) {
        if (!value) {
            return;
        }

        void navigator.clipboard.writeText(value).then(() => {
            setMessage(`${label} скопирован.`);
            setError(null);
        }).catch(() => {
            setError(`Не удалось скопировать ${label.toLowerCase()}.`);
        });
    }

    function submitServerForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/admin/servers", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: (() => {
                            const protocols = normalizeProtocolSelection(
                                serverForm.available_protocols,
                                serverForm.default_protocol,
                            );
                            return JSON.stringify({
                                entity: "server",
                                action: "upsert",
                                ...serverForm,
                                reality_port: serverForm.reality_port ? Number(serverForm.reality_port) : null,
                                tls_port: serverForm.tls_port ? Number(serverForm.tls_port) : null,
                                xhttp_port: serverForm.xhttp_port ? Number(serverForm.xhttp_port) : null,
                                available_protocols: protocols.available,
                                default_protocol: protocols.defaultProtocol,
                                sort_order: Number(serverForm.sort_order || 500),
                            });
                        })(),
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminServersResponse & { detail?: string };
                    if (!response.ok || !("servers" in data)) {
                        throw new Error(data.detail ?? "Не удалось сохранить сервер");
                    }

                    setLiveServerMetrics(data);
                    setMessage(`Сервер ${serverForm.code || serverForm.name} сохранён.`);
                    setServerForm((current) => ({
                        ...current,
                        code: "",
                        name: "",
                        public_name: "",
                        flag: "",
                        host: "",
                        reality_public_key: "",
                        reality_short_id: "",
                        reality_sni: "",
                        reality_port: "",
                        tls_sni: "",
                        tls_port: "",
                        xhttp_host: "",
                        xhttp_path: "/",
                        xhttp_port: "",
                        available_protocols: ["tcp_reality"],
                        default_protocol: "tcp_reality",
                        notes: "",
                    }));
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось сохранить сервер");
                }
            })();
        });
    }

    function submitProfileForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const response = await fetch("/api/admin/servers", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: (() => {
                            const protocols = normalizeProtocolSelection(
                                profileForm.available_protocols,
                                profileForm.default_protocol,
                            );
                            return JSON.stringify({
                                entity: "profile",
                                action: "upsert",
                                ...profileForm,
                                reality_port: profileForm.reality_port ? Number(profileForm.reality_port) : null,
                                tls_port: profileForm.tls_port ? Number(profileForm.tls_port) : null,
                                xhttp_port: profileForm.xhttp_port ? Number(profileForm.xhttp_port) : null,
                                available_protocols: protocols.available,
                                default_protocol: protocols.defaultProtocol,
                                sort_order: Number(profileForm.sort_order || 500),
                            });
                        })(),
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminServersResponse & { detail?: string };
                    if (!response.ok || !("servers" in data)) {
                        throw new Error(data.detail ?? "Не удалось сохранить профиль");
                    }

                    setLiveServerMetrics(data);
                    setMessage(`Профиль ${profileForm.code || profileForm.name} сохранён.`);
                    setProfileForm((current) => ({
                        ...current,
                        code: "",
                        name: "",
                        public_name: "",
                        flag: "",
                        endpoint_host: "",
                        reality_public_key: "",
                        reality_short_id: "",
                        reality_sni: "",
                        reality_port: "",
                        tls_sni: "",
                        tls_port: "",
                        xhttp_host: "",
                        xhttp_path: "/",
                        xhttp_port: "",
                        available_protocols: ["tcp_reality"],
                        default_protocol: "tcp_reality",
                        notes: "",
                    }));
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось сохранить профиль");
                }
            })();
        });
    }

    function toggleProfileState(profile: BackendAdminConnectionProfile) {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch("/api/admin/servers", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            entity: "profile",
                            action: "toggle",
                            code: profile.code,
                            enabled: !profile.is_enabled,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminServersResponse & { detail?: string };
                    if (!response.ok || !("servers" in data)) {
                        throw new Error(data.detail ?? "Не удалось переключить профиль");
                    }
                    setLiveServerMetrics(data);
                    setMessage(`Профиль ${profile.client_label || profile.name} ${profile.is_enabled ? "отключён" : "включён"}.`);
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось переключить профиль");
                }
            })();
        });
    }

    function toggleProfileCatalogVisibility(profile: BackendAdminConnectionProfile, visible: boolean) {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch("/api/admin/servers", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            entity: "profile",
                            action: "catalog",
                            code: profile.code,
                            is_visible_in_catalog: visible,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminServersResponse & { detail?: string };
                    if (!response.ok || !("servers" in data)) {
                        throw new Error(data.detail ?? "Не удалось обновить выдачу профиля");
                    }
                    setLiveServerMetrics(data);
                    setMessage(`Профиль ${profile.client_label} ${visible ? "добавлен в продажу" : "убран из продажи"}.`);
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обновить выдачу профиля");
                }
            })();
        });
    }

    function renameSaleProfile(profile: BackendAdminConnectionProfile) {
        const nextName = (saleNameDrafts[profile.code] ?? "").trim();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch("/api/admin/servers", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            entity: "profile",
                            action: "rename",
                            code: profile.code,
                            public_name: nextName,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminServersResponse & { detail?: string };
                    if (!response.ok || !("servers" in data)) {
                        throw new Error(data.detail ?? "Не удалось обновить название оффера");
                    }
                    setLiveServerMetrics(data);
                    setSaleNameDrafts((current) => ({
                        ...current,
                        [profile.code]: nextName,
                    }));
                    setMessage(nextName
                        ? `Название оффера ${profile.code} обновлено.`
                        : `Клиентское название оффера ${profile.code} сброшено к значению по умолчанию.`);
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обновить название оффера");
                }
            })();
        });
    }

    function submitSettings(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const payload: Record<string, string | boolean> = {};

                    for (const key of editableSettingKeys) {
                        if (!(key in settingsValues)) {
                            continue;
                        }
                        payload[key] = key === "PROMO100_ENABLED"
                            ? settingsValues[key] === "true"
                            : settingsValues[key];
                    }

                    const response = await fetch("/api/admin/settings", {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ values: payload }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось сохранить настройки");
                    }

                    setMessage("Глобальные тарифы обновлены. Перезагружаю раздел…");
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось сохранить настройки");
                }
            })();
        });
    }

    function submitBalance(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const targetUser = resolveAccountReference(balanceAccountId);
                    const rawReference = balanceAccountId.trim();
                    if (!targetUser && !rawReference) {
                        throw new Error("Укажи корректный public ID, account_id или Telegram ID.");
                    }
                    const accountRef = targetUser?.public_id ?? targetUser?.telegram_id ?? rawReference;

                    const payload: { mode: string; amount?: number } = { mode: balanceMode };
                    if (balanceMode !== "reset") {
                        const amount = Number(balanceAmount);
                        if (!Number.isFinite(amount)) {
                            throw new Error("Укажи сумму.");
                        }
                        payload.amount = amount;
                    }

                    const response = await fetch(`/api/admin/users/${accountRef}/balance`, {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось изменить баланс");
                    }

                    setMessage(`Баланс обновлён для ${targetUser ? `${targetUser.public_id ?? `#${targetUser.account_id}`}` : `ID ${accountRef}`}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось изменить баланс");
                }
            })();
        });
    }

    function submitDirectMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const accountRef = directMessageTarget.trim();
                    const text = directMessageText.trim();
                    if (!accountRef) {
                        throw new Error("Укажи ACC, account_id или tg:id получателя.");
                    }
                    if (!text && !directMessageFile) {
                        throw new Error("Нужен текст или один медиафайл.");
                    }

                    const formData = new FormData();
                    formData.set("account_ref", accountRef);
                    if (text) {
                        formData.set("text", text);
                    }
                    if (directMessageFile) {
                        formData.set("media", directMessageFile);
                    }

                    const response = await fetch("/api/admin/messages/send", {
                        method: "POST",
                        body: formData,
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminMessagingActionResponse & { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось отправить сообщение");
                    }

                    setDirectMessageText("");
                    setDirectMessageFile(null);
                    setMessage(`Сообщение отправлено: ${data.target_reference ?? accountRef}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось отправить сообщение");
                }
            })();
        });
    }

    function submitBroadcast(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);

                    const text = broadcastText.trim();
                    if (!text && !broadcastFile) {
                        throw new Error("Нужен текст или один медиафайл.");
                    }

                    const formData = new FormData();
                    if (text) {
                        formData.set("text", text);
                    }
                    if (broadcastFile) {
                        formData.set("media", broadcastFile);
                    }

                    const response = await fetch("/api/admin/messages/broadcast", {
                        method: "POST",
                        body: formData,
                    });
                    const data = (await response.json().catch(() => ({}))) as BackendAdminMessagingActionResponse & { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось запустить рассылку");
                    }

                    setBroadcastText("");
                    setBroadcastFile(null);
                    setMessage(
                        `Рассылка завершена. Отправлено: ${data.sent ?? 0}, ошибок: ${data.failed ?? 0}.`
                    );
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось запустить рассылку");
                }
            })();
        });
    }

    function toggleCreatePermission(permissionKey: string) {
        setCreatePermissions((current) => (
            current.includes(permissionKey)
                ? current.filter((value) => value !== permissionKey)
                : [...current, permissionKey]
        ));
    }

    function submitModeratorAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const email = createEmail.trim();
                    const password = createPassword.trim();
                    if (!email) {
                        throw new Error("Укажи email для moderka-аккаунта.");
                    }
                    if (password.length < 6) {
                        throw new Error("Пароль должен быть не короче 6 символов.");
                    }

                    const response = await fetch("/api/admin/accounts", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                            password,
                            display_name: createDisplayName.trim() || undefined,
                            role: "moderator",
                            permissions: createPermissions,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось создать moderka-аккаунт");
                    }

                    setCreateEmail("");
                    setCreatePassword("");
                    setCreateDisplayName("");
                    setCreatePermissions(permissionCatalog.map((permission) => permission.key));
                    setMessage("Moderka-аккаунт создан. Можно сразу выдавать логин и пароль.");
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось создать moderka-аккаунт");
                }
            })();
        });
    }

    function generateModeratorPassword() {
        setCreatePassword(generateStrongPassword());
        setMessage("Сложный пароль сгенерирован. Его можно сразу выдать модератору.");
        setError(null);
    }

    function updateModeratorPermissions(accountId: number, permissions: string[]) {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/moderators/${accountId}/permissions`, {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ permissions }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось обновить права модератора");
                    }

                    setMessage(`Права модератора #${accountId} обновлены.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обновить права модератора");
                }
            })();
        });
    }

    function toggleModeratorPermission(account: BackendAdminUser, permissionKey: string) {
        const nextPermissions = account.permissions.includes(permissionKey)
            ? account.permissions.filter((value) => value !== permissionKey)
            : [...account.permissions, permissionKey];
        updateModeratorPermissions(account.account_id, nextPermissions);
    }

    function removeRole(accountId: number, role: string) {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/roles/${accountId}/${role}`, {
                        method: "DELETE",
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось снять роль");
                    }

                    setMessage(`Роль ${role} снята с аккаунта #${accountId}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось снять роль");
                }
            })();
        });
    }

    function submitPartnerProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const accountId = Number(partnerAccountId);
                    if (!Number.isFinite(accountId) || accountId <= 0) {
                        throw new Error("Укажи корректный account_id партнёра.");
                    }

                    const response = await fetch(`/api/admin/partners/${accountId}`, {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            display_name: partnerDisplayName || undefined,
                            level1_percent: partnerLevel1Percent ? Number(partnerLevel1Percent) : undefined,
                            level2_percent: partnerLevel2Percent ? Number(partnerLevel2Percent) : undefined,
                            default_payout_details: partnerPayoutDetails || undefined,
                            is_active: partnerIsActive === "true",
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось обновить партнёра");
                    }

                    setMessage(`Тарифы и параметры партнёра #${accountId} обновлены.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обновить партнёра");
                }
            })();
        });
    }

    function processPayoutRequest(requestId: number, status: "approved" | "rejected" | "paid") {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/partner-payouts/${requestId}`, {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ status }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось обработать заявку");
                    }

                    setMessage(`Заявка #${requestId} переведена в статус ${getPayoutStatusLabel(status).toLowerCase()}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обработать заявку");
                }
            })();
        });
    }

    function reviewPartnerApplication(applicationId: number, status: "approved" | "rejected") {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const adminComment = applicationReviewNotes[applicationId]?.trim() || undefined;
                    const response = await fetch(`/api/admin/partner-applications/${applicationId}`, {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ status, admin_comment: adminComment }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось обработать заявку");
                    }

                    setApplicationReviewNotes((current) => {
                        const next = { ...current };
                        delete next[applicationId];
                        return next;
                    });
                    setMessage(`Заявка #${applicationId} ${status === "approved" ? "одобрена" : "отклонена"}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось обработать заявку");
                }
            })();
        });
    }

    function togglePartnerAvailability(partner: BackendAdminPartner) {
        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/partners/${partner.account_id}`, {
                        method: "PATCH",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            is_active: !partner.is_active,
                        }),
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось изменить статус партнёра");
                    }

                    setMessage(`Партнёр #${partner.account_id} ${partner.is_active ? "отключён" : "снова активирован"}.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось изменить статус партнёра");
                }
            })();
        });
    }

    function deletePortalAccount(accountId: number, label: string) {
        if (!window.confirm(`Удалить ${label} #${accountId}? Это действие необратимо.`)) {
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/accounts?accountId=${accountId}`, {
                        method: "DELETE",
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? `Не удалось удалить ${label}`);
                    }

                    setMessage(`${label} #${accountId} удалён. Все привязанные роли и связи очищены.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : `Не удалось удалить ${label}`);
                }
            })();
        });
    }

    function hydratePartnerForm(partner: BackendAdminPartner) {
        setPartnerAccountId(String(partner.account_id));
        setPartnerDisplayName(partner.display_name ?? "");
        setPartnerLevel1Percent(String(partner.level1_percent));
        setPartnerLevel2Percent(String(partner.level2_percent));
        setPartnerPayoutDetails(partner.default_payout_details ?? "");
        setPartnerIsActive(partner.is_active ? "true" : "false");
    }

    function resetPromoForm() {
        setEditingPromoCode(null);
        setPromoCode("");
        setPromoType("topup_bonus");
        setPromoBonus("");
        setPromoMinAmount("");
        setPromoMaxAmount("");
        setPromoMaxBonusAmount("");
        setPromoActivationLimit("");
        setPromoStartDate("");
        setPromoEndDate("");
        setPromoIsActive(true);
    }

    function hydratePromoForm(promo: BackendPromo) {
        setEditingPromoCode(promo.code);
        setPromoCode(promo.code);
        setPromoType(promo.promo_type);
        setPromoBonus(String(promo.bonus));
        setPromoMinAmount(promo.min_amount > 0 ? String(promo.min_amount) : "");
        setPromoMaxAmount(promo.max_amount > 0 ? String(promo.max_amount) : "");
        setPromoMaxBonusAmount(promo.max_bonus_amount > 0 ? String(promo.max_bonus_amount) : "");
        setPromoActivationLimit(promo.activation_limit > 0 ? String(promo.activation_limit) : "");
        setPromoStartDate(toDateTimeLocalValue(promo.start_date));
        setPromoEndDate(toDateTimeLocalValue(promo.end_date));
        setPromoIsActive(promo.is_active);
    }

    function buildPromoPayload() {
        const normalizedCode = promoCode.trim().toUpperCase();
        const bonus = Number(promoBonus);
        if (!normalizedCode && !editingPromoCode) {
            throw new Error("Укажи код промокода.");
        }
        if (!Number.isFinite(bonus) || bonus <= 0) {
            throw new Error(
                promoType === "balance_credit"
                    ? "Укажи сумму начисления по промокоду."
                    : "Укажи процент бонуса на пополнение."
            );
        }

        return {
            code: normalizedCode,
            promo_type: promoType,
            bonus,
            min_amount: promoMinAmount ? Number(promoMinAmount) : 0,
            max_amount: promoMaxAmount ? Number(promoMaxAmount) : 0,
            max_bonus_amount: promoMaxBonusAmount ? Number(promoMaxBonusAmount) : 0,
            activation_limit: promoActivationLimit ? Number(promoActivationLimit) : 0,
            start_date: promoStartDate ? new Date(promoStartDate).toISOString() : null,
            end_date: promoEndDate ? new Date(promoEndDate).toISOString() : null,
            is_active: promoIsActive,
        };
    }

    function submitPromo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const payload = buildPromoPayload();
                    const isEditing = Boolean(editingPromoCode);
                    const response = await fetch(
                        isEditing ? `/api/admin/promocodes/${encodeURIComponent(editingPromoCode ?? payload.code)}` : "/api/admin/promocodes",
                        {
                            method: isEditing ? "PATCH" : "POST",
                            headers: {
                                "content-type": "application/json",
                            },
                            body: JSON.stringify(isEditing ? { ...payload, code: undefined } : payload),
                        },
                    );
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось сохранить промокод");
                    }

                    setMessage(isEditing ? `Промокод ${editingPromoCode} обновлён.` : `Промокод ${payload.code} создан.`);
                    resetPromoForm();
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось сохранить промокод");
                }
            })();
        });
    }

    function deletePromo(code: string) {
        if (!window.confirm(`Удалить промокод ${code}? Это действие необратимо.`)) {
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setMessage(null);
                    setError(null);
                    const response = await fetch(`/api/admin/promocodes/${encodeURIComponent(code)}`, {
                        method: "DELETE",
                    });
                    const data = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(data.detail ?? "Не удалось удалить промокод");
                    }

                    if (editingPromoCode === code) {
                        resetPromoForm();
                    }
                    setMessage(`Промокод ${code} удалён.`);
                    router.refresh();
                } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Не удалось удалить промокод");
                }
            })();
        });
    }

    return (
        <div className="grid min-w-0 gap-8">
            {(message || error) && (
                <div
                    className={cn(
                        "rounded-[32px] border-2 p-5 text-sm",
                        error
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                    )}
                >
                    {error ?? message}
                </div>
            )}

            {isStatsSection && (
                canAccessStatsSection ? (
                    <>
                        {overview && (canViewDashboardStats || canViewUserCounts) && (
                            <div className="grid gap-6 xl:grid-cols-4">
                                {canViewUserCounts && (
                                    <>
                                        <MetricCard
                                            label="Аккаунты"
                                            value={overview.accounts_total === null ? "Скрыто" : String(overview.accounts_total)}
                                            note={overview.accounts_total === null
                                                ? "Счётчики скрыты"
                                                : `Telegram: ${overview.telegram_linked_total ?? 0} • Email: ${overview.email_linked_total ?? 0}`}
                                        />
                                        <MetricCard
                                            label="Команда"
                                            value={overview.admins_total === null || overview.moderators_total === null
                                                ? "Скрыто"
                                                : String((overview.admins_total ?? 0) + (overview.moderators_total ?? 0))}
                                            note={overview.admins_total === null || overview.moderators_total === null
                                                ? "Состав команды скрыт"
                                                : `Админы: ${overview.admins_total ?? 0} • Модераторы: ${overview.moderators_total ?? 0}`}
                                        />
                                    </>
                                )}
                                {canViewDashboardStats && (
                                    <>
                                        <MetricCard
                                            label="Устройства"
                                            value={overview.devices_total === null ? "Скрыто" : String(overview.devices_total)}
                                            note={overview.devices_active === null ? "Статистика устройств скрыта" : `Активно: ${overview.devices_active}`}
                                        />
                                        <MetricCard
                                            label="Ключи онлайн"
                                            value={overview.keys_online_total === null ? "Нет live" : String(overview.keys_online_total)}
                                            note={overview.keys_online_total === null ? "Marzban временно не ответил" : "Сейчас подключены к VPN"}
                                        />
                                        <MetricCard
                                            label="Ключи ограничены"
                                            value={overview.keys_limited_total === null ? "Скрыто" : String(overview.keys_limited_total)}
                                            note="Отключены из-за баланса или лимита"
                                        />
                                        <MetricCard
                                            label="Оборот"
                                            value={overview.payments_total === null ? "Скрыто" : formatMoney(overview.payments_total)}
                                            note={overview.payments_month_total === null
                                                ? "Финансовая статистика скрыта"
                                                : `За месяц: ${formatMoney(overview.payments_month_total)}`}
                                        />
                                        <MetricCard
                                            label="Обращения в поддержку"
                                            value={overview.support_requests_daily === null ? "Скрыто" : String(overview.support_requests_daily)}
                                            note="За последние 24 часа"
                                        />
                                        <MetricCard
                                            label="Новые клиенты"
                                            value={overview.new_accounts_daily === null ? "Скрыто" : String(overview.new_accounts_daily)}
                                            note="Регистрации за последние 24 часа"
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {(canViewUserList || canManageUserBalance || recentAccounts.length > 0) && (
                            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                                {canViewUserList && (
                                    <SectionCard
                                        title="Пользователи"
                                        description="Живой список аккаунтов с ролями, балансом и каналами входа."
                                    >
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left text-sm">
                                                <thead className="text-xs uppercase tracking-normal text-white/40">
                                                    <tr>
                                                        <th className="pb-3 pr-4">ID</th>
                                                        <th className="pb-3 pr-4">Пользователь</th>
                                                        <th className="pb-3 pr-4">Связь</th>
                                                        <th className="pb-3 pr-4">Баланс</th>
                                                        <th className="pb-3 pr-4">Устройства</th>
                                                        <th className="pb-3 pr-4">Роли</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedUsers.map((user) => (
                                                        <tr
                                                            key={user.account_id}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => void loadUserDetail(user)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === "Enter" || event.key === " ") {
                                                                    event.preventDefault();
                                                                    void loadUserDetail(user);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "cursor-pointer border-t border-white/10 align-top transition hover:bg-white/5 focus-visible:outline-none",
                                                                selectedUserAccountId === user.account_id && "bg-white/5"
                                                            )}
                                                        >
                                                            <td className="py-3 pr-4">
                                                                <div className="font-bold">{user.public_id ?? `#${user.account_id}`}</div>
                                                                <div className="text-xs text-white/45">#{user.account_id}</div>
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                <div className="font-semibold">{user.display_name || user.email || user.telegram_username || "Без имени"}</div>
                                                                <div className="text-xs text-white/45">{formatAdminIdentityLine(user)}</div>
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                <span
                                                                    className={cn(
                                                                        "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                                        getLinkStateTone(user.link_state)
                                                                    )}
                                                                >
                                                                    {user.link_state_label}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 pr-4">{formatMoney(user.balance)}</td>
                                                            <td className="py-3 pr-4">{user.devices_total}</td>
                                                            <td className="py-3 pr-4">{user.roles.length > 0 ? user.roles.join(", ") : "user"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SectionCard>
                                )}

                                <div className="grid gap-8">
                                    {canViewUserList && (
                                        <UserLeadCard
                                            detail={selectedUserDetail}
                                            isLoading={isUserDetailLoading}
                                            onCopy={copyAdminValue}
                                            onUseForBalance={fillBalanceTarget}
                                        />
                                    )}

                                    {canManageUserBalance && (
                                        <SectionCard
                                            title="Баланс и ручные действия"
                                            description="Пополнение, установка или сброс баланса по ACC, account_id или Telegram."
                                        >
                                            <form className="grid gap-4" onSubmit={submitBalance}>
                                                <input
                                                    type="text"
                                                    placeholder="ACC_... или tg:123456789"
                                                    value={balanceAccountId}
                                                    onChange={(event) => setBalanceAccountId(event.target.value)}
                                                    className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                                />
                                                <div className="text-xs text-white/45">
                                                    Лучше использовать public ID вида <span className="font-semibold">ACC_...</span>. Также поддерживаются <span className="font-semibold">tg:123456789</span> и legacy numeric ID.
                                                </div>
                                                <select
                                                    value={balanceMode}
                                                    onChange={(event) => setBalanceMode(event.target.value as BalanceMode)}
                                                    className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                                >
                                                    <option value="add">Добавить к балансу</option>
                                                    <option value="set">Установить баланс</option>
                                                    <option value="reset">Обнулить баланс</option>
                                                </select>
                                                {balanceMode !== "reset" && (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Сумма"
                                                        value={balanceAmount}
                                                        onChange={(event) => setBalanceAmount(event.target.value)}
                                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                                    />
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                                >
                                                    {isPending ? "Сохраняем..." : "Применить"}
                                                </button>
                                            </form>
                                        </SectionCard>
                                    )}

                                    {canViewUserList && recentAccounts.length > 0 && (
                                        <SectionCard
                                            title="Последние регистрации"
                                            description="Быстрый просмотр самых свежих аккаунтов в системе."
                                        >
                                                    <div className="space-y-3">
                                                        {recentAccounts.map((user) => (
                                                            <button
                                                                key={user.account_id}
                                                                type="button"
                                                                onClick={() => void loadUserDetail(user)}
                                                                className={cn(
                                                                    "block w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/5",
                                                                    selectedUserAccountId === user.account_id && "border-white/25 bg-white/5"
                                                                )}
                                                            >
                                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                                    <div>
                                                                        <div className="font-semibold">{user.display_name || user.email || user.telegram_username || "Новый аккаунт"}</div>
                                                                        <div className="text-xs text-white/45">{user.public_id ?? `#${user.account_id}`}</div>
                                                                        <div className="mt-1 text-xs text-white/45">{formatAdminIdentityLine(user)}</div>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                                        getLinkStateTone(user.link_state)
                                                                    )}
                                                                >
                                                                    {user.link_state_label}
                                                                </span>
                                                            </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </SectionCard>
                                            )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включены ни статистика, ни просмотр пользователей, ни ручные действия с балансом."
                    />
                )
            )}

            {isServersSection && (
                canAccessServersSection ? (
                    <>
                        <SectionCard
                            title="Продажа серверов"
                            description="Кнопка сразу добавляет или убирает профиль из каталога сайта и бота. Внутреннее подключение серверов из админки скрыто."
                        >
                            {saleProfiles.length > 0 ? (
                                <div className="grid gap-4">
                                    {saleProfiles.map((profile) => (
                                        <div key={profile.code} className="min-w-0 rounded-[28px] border-2 border-white/10 bg-black/20 p-6">
                                            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold uppercase tracking-normal text-white/40">Оффер</div>
                                                    <div className="mt-2 break-words text-2xl font-black uppercase tracking-tight text-white">
                                                        {profile.flag ? `${profile.flag} ` : ""}{profile.client_label}
                                                    </div>
                                                    <div className="mt-2 text-sm text-white/55">
                                                        {profile.mode === "bridge" ? "С маршрутизацией" : "Прямое подключение"} • {formatProtocolList(profile.available_protocols, profile.default_protocol)}
                                                    </div>
                                                    {profile.notes && (
                                                        <div className="mt-3 text-sm text-white/45">
                                                            {profile.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-4">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-bold uppercase tracking-normal text-white/45">Продажа</div>
                                                            <div className="mt-1 break-words text-sm font-semibold text-white">
                                                                {profile.is_visible_in_catalog ? "Показываем клиентам" : "Скрыт из каталога"}
                                                            </div>
                                                        </div>
                                                        {canManageServersSection ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleProfileCatalogVisibility(profile, !profile.is_visible_in_catalog)}
                                                                className={cn(
                                                                    buttonVariants({ variant: profile.is_visible_in_catalog ? "outline" : "brand", size: "sm" }),
                                                                    "h-11 w-full rounded-2xl px-4 text-xs font-bold uppercase tracking-[0.14em] sm:w-auto",
                                                                    profile.is_visible_in_catalog
                                                                        ? "border-red-400/30 text-red-200 hover:border-red-300/50 hover:bg-red-500/10 hover:text-red-100"
                                                                        : "shadow-[0_0_16px_rgba(249,115,22,0.22)]"
                                                                )}
                                                            >
                                                                {profile.is_visible_in_catalog ? "Убрать из продажи" : "Вернуть в продажу"}
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-4 grid gap-2 text-sm text-white/55">
                                                        <div>Entry: {profile.entry_server_name ?? profile.entry_server_code}</div>
                                                        <div>Панель: {profile.managed_server_name ?? profile.managed_server_code ?? "нет"}</div>
                                                        <div>Статус: {profile.is_enabled ? "активен" : "выключен"}</div>
                                                    </div>
                                                    <div className="mt-4 grid gap-3">
                                                        <div>
                                                            <div className="text-[11px] font-bold uppercase tracking-normal text-white/45">Название для клиента</div>
                                                            <input
                                                                type="text"
                                                                value={saleNameDrafts[profile.code] ?? ""}
                                                                onChange={(event) => setSaleNameDrafts((current) => ({
                                                                    ...current,
                                                                    [profile.code]: event.target.value,
                                                                }))}
                                                                placeholder={profile.client_label}
                                                                disabled={!canManageServersSection}
                                                                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white placeholder:text-white/30 disabled:opacity-60"
                                                            />
                                                        </div>
                                                        {canManageServersSection ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => renameSaleProfile(profile)}
                                                                disabled={isPending}
                                                                className={cn(
                                                                    buttonVariants({ variant: "brand", size: "sm" }),
                                                                    "h-11 w-full uppercase tracking-normal disabled:opacity-60"
                                                                )}
                                                            >
                                                                {isPending ? "Сохраняем..." : "Сохранить название"}
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Офферы не найдены"
                                    description="Фиксированный список профилей ещё не появился в snapshot админки."
                                />
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Live-нагрузка серверов"
                            description="Детальный live-срез по площадкам управления. Здесь снова видны CPU, память, онлайн и текущая нагрузка."
                        >
                            {servers.length > 0 ? (
                                <div className="grid gap-4">
                                    {servers.map((server) => (
                                        <ServerMetricsCard
                                            key={server.code}
                                            server={server}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Серверы не найдены"
                                    description="В snapshot backend пока не пришёл ни один сервер."
                                />
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Профили выдачи"
                            description="Live-статус профилей подключения, которые используются для сайта, бота и автопровижининга."
                        >
                            {profiles.length > 0 ? (
                                <div className="grid gap-4">
                                    {profiles.map((profile) => (
                                        <ConnectionProfileCard
                                            key={profile.code}
                                            profile={profile}
                                            canManage={canManageServersSection}
                                            isPending={isPending}
                                            onToggle={toggleProfileState}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Профили не найдены"
                                    description="В snapshot backend пока не пришёл ни один профиль подключения."
                                />
                            )}
                        </SectionCard>
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включён просмотр серверной нагрузки и live-метрик."
                    />
                )
            )}

            {isMessagingSection && (
                canAccessMessagingSection ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-3">
                            <MetricCard
                                label="Получатели"
                                value={String(messagingOverview?.recipients_total ?? 0)}
                                note="Уникальные Telegram-чаты для отправки"
                            />
                            <MetricCard
                                label="Через backend"
                                value={String(messagingOverview?.canonical_targets_total ?? 0)}
                                note="Канонические аккаунты с Telegram-привязкой"
                            />
                            <MetricCard
                                label="Legacy-only"
                                value={String(messagingOverview?.legacy_only_targets_total ?? 0)}
                                note="Старые TG-пользователи вне backend-связки"
                            />
                        </div>

                        <div className="grid gap-8 xl:grid-cols-2">
                            <SectionCard
                                title="Сообщение пользователю"
                                description="Точечная отправка в Telegram по ACC, account_id или tg:123456789. Поддерживается один photo/video/document."
                            >
                                <form className="grid gap-4" onSubmit={submitDirectMessage}>
                                    <input
                                        type="text"
                                        placeholder="ACC_... или tg:123456789"
                                        value={directMessageTarget}
                                        onChange={(event) => setDirectMessageTarget(event.target.value)}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                    />
                                    <textarea
                                        placeholder="Текст сообщения или подпись к медиа"
                                        value={directMessageText}
                                        onChange={(event) => setDirectMessageText(event.target.value)}
                                        className="min-h-36 rounded-[28px] border-2 border-white/15 bg-black/20 px-4 py-4 text-sm font-medium text-white/85 outline-none transition focus:border-white/30"
                                    />
                                    <label className="grid gap-2 rounded-[28px] border-2 border-dashed border-white/15 bg-black/20 p-4">
                                        <span className="text-xs font-bold uppercase tracking-normal text-white/45">Медиафайл</span>
                                        <input
                                            type="file"
                                            accept="image/*,video/*,.pdf,.zip,.txt,.doc,.docx,.xls,.xlsx,.mp4,.mov,.avi,.mkv"
                                            onChange={(event) => setDirectMessageFile(event.target.files?.[0] ?? null)}
                                            className="text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-normal file:text-white"
                                        />
                                        <span className="text-xs text-white/45">
                                            {directMessageFile ? `Выбран файл: ${directMessageFile.name}` : "Необязательно. Один photo, video или document."}
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                    >
                                        {isPending ? "Отправляем..." : "Отправить"}
                                    </button>
                                </form>
                            </SectionCard>

                            <SectionCard
                                title="Рассылка в Telegram"
                                description="Массовая отправка всем доступным Telegram-получателям. Тоже поддерживает один media-файл."
                            >
                                <form className="grid gap-4" onSubmit={submitBroadcast}>
                                    <textarea
                                        placeholder="Текст рассылки или подпись к медиа"
                                        value={broadcastText}
                                        onChange={(event) => setBroadcastText(event.target.value)}
                                        className="min-h-36 rounded-[28px] border-2 border-white/15 bg-black/20 px-4 py-4 text-sm font-medium text-white/85 outline-none transition focus:border-white/30"
                                    />
                                    <label className="grid gap-2 rounded-[28px] border-2 border-dashed border-white/15 bg-black/20 p-4">
                                        <span className="text-xs font-bold uppercase tracking-normal text-white/45">Медиафайл</span>
                                        <input
                                            type="file"
                                            accept="image/*,video/*,.pdf,.zip,.txt,.doc,.docx,.xls,.xlsx,.mp4,.mov,.avi,.mkv"
                                            onChange={(event) => setBroadcastFile(event.target.files?.[0] ?? null)}
                                            className="text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-normal file:text-white"
                                        />
                                        <span className="text-xs text-white/45">
                                            {broadcastFile ? `Выбран файл: ${broadcastFile.name}` : "Необязательно. Один photo, video или document."}
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                    >
                                        {isPending ? "Рассылаем..." : "Запустить рассылку"}
                                    </button>
                                </form>
                            </SectionCard>
                        </div>

                        {canViewUserList && (
                            <SectionCard
                                title="Получатели из backend"
                                description="Быстрый выбор аккаунта с Telegram-привязкой. Клик подставляет ACC или tg:id в форму отправки."
                            >
                                {messageableUsers.length > 0 ? (
                                    <>
                                        <div className="grid gap-4 xl:grid-cols-2">
                                            {messageableUsers.slice(0, 12).map((user) => {
                                                const telegramProfileHref = buildTelegramProfileHref(user);
                                                const accountReference = getDirectMessageTargetValue(user);

                                                return (
                                                    <button
                                                        key={user.account_id}
                                                        type="button"
                                                        onClick={() => fillDirectMessageTarget(user)}
                                                        className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5 text-left transition hover:border-white/20 hover:bg-white/5"
                                                    >
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div>
                                                                <div className="text-lg font-black uppercase tracking-tight">
                                                                    {user.display_name || user.email || user.telegram_username || user.public_id || `#${user.account_id}`}
                                                                </div>
                                                                <div className="mt-1 text-xs text-white/45">
                                                                    {user.public_id ?? `#${user.account_id}`} • {accountReference}
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                                    getLinkStateTone(user.link_state)
                                                                )}
                                                            >
                                                                {user.link_state_label}
                                                            </span>
                                                        </div>
                                                        <div className="mt-4 text-sm text-white/75">
                                                            {formatAdminIdentityLine(user)}
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/50">
                                                            <span>Баланс: {formatMoney(user.balance)}</span>
                                                            <span>Устройств: {user.devices_total}</span>
                                                            {telegramProfileHref && (
                                                                <span className="text-sky-200/85">{telegramProfileHref}</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {messageableUsers.length > 12 && (
                                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                                                Показаны первые 12 аккаунтов из списка. Для остальных можно ввести ACC, account_id или `tg:123456789` вручную.
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <EmptyState
                                        title="Получатели не найдены"
                                        description="В backend пока нет активных аккаунтов с Telegram-привязкой. Legacy-получателей всё равно можно отправлять вручную по tg:id."
                                    />
                                )}
                            </SectionCard>
                        )}
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включены сообщения и Telegram-рассылки."
                    />
                )
            )}

            {isPartnerApplicationsSection && (
                canAccessPartnerApplicationsSection ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-4">
                            <MetricCard label="Всего заявок" value={String(sortedPartnerApplications.length)} note="Все обращения на партнёрский кабинет" />
                            <MetricCard label="Ожидают" value={String(pendingPartnerApplications.length)} note="Требуют решения администратора" />
                            <MetricCard label="Одобрено" value={String(approvedPartnerApplications.length)} note="Аккаунт партнёра уже создан" />
                            <MetricCard label="Отклонено" value={String(rejectedPartnerApplications.length)} note="Отказы и архив рассмотренных заявок" />
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
                            <SectionCard
                                title="Новые заявки"
                                description="Email, пароль и комментарий приходят сюда до создания отдельного partner-кабинета."
                            >
                                {pendingPartnerApplications.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingPartnerApplications.map((application) => (
                                            <div key={application.id} className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-lg font-black uppercase tracking-tight">{application.email}</div>
                                                        <div className="mt-1 text-xs text-white/45">Заявка #{application.id} • {formatDateTime(application.created_at)}</div>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                            getApplicationStatusTone(application.status)
                                                        )}
                                                    >
                                                        {getApplicationStatusLabel(application.status)}
                                                    </span>
                                                </div>
                                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75 whitespace-pre-wrap">
                                                    {application.comment?.trim() || "Комментарий не добавлен."}
                                                </div>
                                                {canReviewPartnerApplications ? (
                                                    <>
                                                        <textarea
                                                            rows={3}
                                                            value={applicationReviewNotes[application.id] ?? ""}
                                                            onChange={(event) => setApplicationReviewNotes((current) => ({
                                                                ...current,
                                                                [application.id]: event.target.value,
                                                            }))}
                                                            className="mt-4 w-full rounded-2xl border-2 border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white placeholder:text-white/35"
                                                            placeholder="Комментарий администратора: что ответить партнёру или почему заявка отклонена"
                                                        />
                                                        <div className="mt-4 flex flex-wrap gap-3">
                                                            <button
                                                                type="button"
                                                                disabled={isPending}
                                                                onClick={() => reviewPartnerApplication(application.id, "approved")}
                                                                className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-11 uppercase tracking-normal disabled:opacity-60")}
                                                            >
                                                                Одобрить и создать кабинет
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={isPending}
                                                                onClick={() => reviewPartnerApplication(application.id, "rejected")}
                                                                className="h-11 rounded-full border-2 border-red-500/25 px-5 text-xs font-bold uppercase tracking-normal text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                                                            >
                                                                Отклонить
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
                                                        Для этой staff-учётки включён только просмотр заявок без права принимать решение.
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Пусто"
                                        description="Сейчас нет новых заявок на подключение партнёрского кабинета."
                                    />
                                )}
                            </SectionCard>

                            <SectionCard
                                title="История решений"
                                description="Одобренные и отклонённые заявки с результатом обработки."
                            >
                                {reviewedPartnerApplications.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviewedPartnerApplications.map((application) => (
                                            <div key={application.id} className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-bold">{application.email}</div>
                                                        <div className="mt-1 text-xs text-white/45">
                                                            Заявка #{application.id} • рассмотрена {formatDateTime(application.reviewed_at)}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                            getApplicationStatusTone(application.status)
                                                        )}
                                                    >
                                                        {getApplicationStatusLabel(application.status)}
                                                    </span>
                                                </div>
                                                {application.created_partner_account_id && (
                                                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                                                        Создан partner-аккаунт #{application.created_partner_account_id}.
                                                    </div>
                                                )}
                                                {application.admin_comment && (
                                                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75 whitespace-pre-wrap">
                                                        {application.admin_comment}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="История пока пустая"
                                        description="Как только заявки начнут рассматриваться, они появятся здесь."
                                    />
                                )}
                            </SectionCard>
                        </div>
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включены ни просмотр заявок на партнёрку, ни их обработка."
                    />
                )
            )}

            {isPartnersSection && (
                canAccessPartnersSection ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-4">
                            <MetricCard label="Партнёры" value={String(sortedPartners.length)} note="Все зарегистрированные partner-аккаунты" />
                            <MetricCard label="Активны" value={String(activePartners.length)} note={`Отключены: ${sortedPartners.length - activePartners.length}`} />
                            <MetricCard label="Реф. ссылки" value={String(totalPartnerLinks)} note="Сколько ссылок сейчас создано" />
                            <MetricCard label="Доступно к выводу" value={formatMoney(totalPartnerAvailable)} note={`В ожидании: ${formatMoney(totalPartnerPendingPayouts)}`} />
                        </div>

                        {isAdmin && (
                            <div className="rounded-[32px] border-2 border-amber-500/25 bg-amber-500/10 p-6 text-sm text-amber-100">
                                При удалении партнёра его аккаунт полностью удаляется, а все его рефералы становятся обычными пользователями без начислений наверх.
                            </div>
                        )}

                        {sortedPartners.length > 0 ? (
                            <div className="grid gap-5">
                                {sortedPartners.map((partner) => (
                                    <SectionCard
                                        key={partner.account_id}
                                        title={`${partner.public_id ?? `#${partner.account_id}`} ${partner.display_name || partner.email || partner.telegram_username || "Партнёр"}`}
                                        description={partner.email || partner.telegram_id || "Без внешней привязки"}
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className={cn(
                                                    "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                    partner.is_active
                                                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                                        : "border-red-500/25 bg-red-500/10 text-red-200"
                                                )}
                                            >
                                                {partner.is_active ? "Активен" : "Отключён"}
                                            </span>
                                            <span className="text-xs text-white/45">Внутренний ID #{partner.account_id}</span>
                                        </div>

                                        <div className="mt-5 grid gap-3 md:grid-cols-4">
                                            <MiniStat label="Ссылок" value={String(partner.links_total)} />
                                            <MiniStat label="Всего комиссий" value={formatMoney(partner.total_commission)} />
                                            <MiniStat label="Доступно" value={formatMoney(partner.available_commission)} />
                                            <MiniStat label="Ожидает вывода" value={formatMoney(partner.pending_payout_total)} />
                                        </div>

                                        <div className="mt-5 text-sm text-white/65">
                                            Текущие тарифы: <span className="font-semibold text-white">{partner.level1_percent}% / {partner.level2_percent}%</span>
                                        </div>

                                        {(isAdmin || canManagePartnerStatus) && (
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() => togglePartnerAvailability(partner)}
                                                    className="h-11 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10 disabled:opacity-60"
                                                >
                                                    {partner.is_active ? "Отключить партнёра" : "Включить партнёра"}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        disabled={isPending}
                                                        onClick={() => deletePortalAccount(partner.account_id, "партнёра")}
                                                        className="h-11 rounded-full border-2 border-red-500/25 px-5 text-xs font-bold uppercase tracking-normal text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                                                    >
                                                        Удалить аккаунт
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </SectionCard>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Партнёров пока нет"
                                description="Когда партнёрские аккаунты начнут создаваться, весь список и статистика появятся здесь."
                            />
                        )}
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включены ни просмотр списка партнёров, ни управление их статусом."
                    />
                )
            )}

            {isPartnerRatesSection && (
                isAdmin ? (
                    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                        <SectionCard
                            title="Глобальные тарифы"
                            description="Базовые проценты и системные настройки, которые влияют на партнёрскую программу."
                        >
                            {overview ? (
                                <form className="grid gap-4" onSubmit={submitSettings}>
                                    {partnerRateSettingKeys.map((key) => {
                                        const setting = overview.settings[key];
                                        if (!setting) {
                                            return null;
                                        }

                                        return (
                                            <label key={key} className="rounded-2xl border-2 border-white/10 p-4">
                                                <div className="text-sm font-bold uppercase tracking-normal text-white/45">{setting.label}</div>
                                                <div className="mt-1 text-xs text-white/45">{setting.description}</div>
                                                <input
                                                    type={setting.type === "str" ? "text" : "number"}
                                                    step={setting.type === "float" ? "0.01" : "1"}
                                                    value={settingsValues[key] ?? String(setting.value)}
                                                    onChange={(event) => setSettingsValues((current) => ({ ...current, [key]: event.target.value }))}
                                                    className="mt-3 h-11 w-full rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                                />
                                            </label>
                                        );
                                    })}

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                    >
                                        {isPending ? "Сохраняем..." : "Сохранить тарифы"}
                                    </button>
                                </form>
                            ) : (
                                <EmptyState
                                    title="Настройки не загрузились"
                                    description="Обнови страницу или проверь backend, чтобы отредактировать глобальные проценты."
                                />
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Индивидуальные условия партнёра"
                            description="Точные проценты, отображаемое имя и реквизиты по умолчанию для конкретного партнёра."
                        >
                            {sortedPartners.length > 0 ? (
                                <>
                                    <form className="grid gap-4" onSubmit={submitPartnerProfile}>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Account ID партнёра"
                                            value={partnerAccountId}
                                            onChange={(event) => setPartnerAccountId(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Название в партнёрском ЛК"
                                            value={partnerDisplayName}
                                            onChange={(event) => setPartnerDisplayName(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="% 1 уровня"
                                                value={partnerLevel1Percent}
                                                onChange={(event) => setPartnerLevel1Percent(event.target.value)}
                                                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="% 2 уровня"
                                                value={partnerLevel2Percent}
                                                onChange={(event) => setPartnerLevel2Percent(event.target.value)}
                                                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                            />
                                        </div>
                                        <textarea
                                            rows={4}
                                            placeholder="Реквизиты по умолчанию"
                                            value={partnerPayoutDetails}
                                            onChange={(event) => setPartnerPayoutDetails(event.target.value)}
                                            className="rounded-2xl border-2 border-white/15 bg-black/20 px-4 py-3 font-medium"
                                        />
                                        <select
                                            value={partnerIsActive}
                                            onChange={(event) => setPartnerIsActive(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        >
                                            <option value="true">Партнёр активен</option>
                                            <option value="false">Партнёр отключён</option>
                                        </select>

                                        {selectedPartner && (
                                            <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                                                Редактируется партнёр <span className="font-bold">{selectedPartner.public_id ?? `#${selectedPartner.account_id}`}</span>
                                                {" · "}
                                                <span className="font-semibold">
                                                    {selectedPartner.display_name || selectedPartner.email || selectedPartner.telegram_username || selectedPartner.telegram_id || "Без имени"}
                                                </span>
                                                <div className="mt-1 text-xs text-emerald-100/70">
                                                    Текущие условия: {selectedPartner.level1_percent}% / {selectedPartner.level2_percent}%
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                        >
                                            {isPending ? "Сохраняем..." : "Сохранить параметры"}
                                        </button>
                                    </form>

                                    <div className="mt-6 space-y-3">
                                        {sortedPartners.map((partner) => (
                                            <button
                                                key={partner.account_id}
                                                type="button"
                                                onClick={() => hydratePartnerForm(partner)}
                                                className="w-full rounded-2xl border-2 border-white/10 p-4 text-left transition hover:bg-white/5"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <div className="font-bold">
                                                            {partner.public_id ?? `#${partner.account_id}`} {partner.display_name || partner.email || partner.telegram_username || "Партнёр"}
                                                        </div>
                                                        <div className="text-xs text-white/45">{partner.email || partner.telegram_id || "Без внешней привязки"}</div>
                                                    </div>
                                                    <div className="text-right text-xs text-white/55">
                                                        <div>{partner.level1_percent}% / {partner.level2_percent}%</div>
                                                        <div>Доступно: {formatMoney(partner.available_commission)}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    title="Партнёров пока нет"
                                    description="Сначала одобри заявку или создай partner-аккаунт, а потом настрой индивидуальные проценты."
                                />
                            )}
                        </SectionCard>
                    </div>
                ) : (
                    <AccessState
                        title="Нужен admin-доступ"
                        description="Глобальные тарифы и индивидуальные проценты партнёров может редактировать только admin."
                    />
                )
            )}

            {isPromosSection && (
                isAdmin ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-4">
                            <MetricCard label="Промокоды" value={String(promocodes.length)} note="Все созданные balance/topup промо" />
                            <MetricCard
                                label="Активны сейчас"
                                value={String(promocodes.filter((promo) => promo.is_active_now).length)}
                                note="Окно действия уже открыто"
                            />
                            <MetricCard
                                label="Балансные"
                                value={String(promocodes.filter((promo) => promo.promo_type === "balance_credit").length)}
                                note="Сразу начисляют рубли на баланс"
                            />
                            <MetricCard
                                label="Бонус на пополнение"
                                value={String(promocodes.filter((promo) => promo.promo_type === "topup_bonus").length)}
                                note="Процент к платежу через ЮKassa"
                            />
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
                            <SectionCard
                                title={editingPromoCode ? `Редактировать ${editingPromoCode}` : "Создать промокод"}
                                description="Выбирай тип промокода: либо мгновенное начисление баланса, либо бонус к пополнению в заданном диапазоне сумм."
                            >
                                <form className="grid gap-4" onSubmit={submitPromo}>
                                    <input
                                        type="text"
                                        placeholder="Код промокода"
                                        value={promoCode}
                                        onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                                        disabled={Boolean(editingPromoCode)}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold disabled:opacity-60"
                                    />

                                    <select
                                        value={promoType}
                                        onChange={(event) => setPromoType(event.target.value as BackendPromo["promo_type"])}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                    >
                                        <option value="topup_bonus">Бонус при пополнении</option>
                                        <option value="balance_credit">Начисление баланса</option>
                                    </select>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder={promoType === "balance_credit" ? "Сумма начисления, ₽" : "Процент бонуса, %"}
                                        value={promoBonus}
                                        onChange={(event) => setPromoBonus(event.target.value)}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="От суммы, ₽"
                                            value={promoMinAmount}
                                            onChange={(event) => setPromoMinAmount(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="До суммы, ₽"
                                            value={promoMaxAmount}
                                            onChange={(event) => setPromoMaxAmount(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Макс. бонус в рублях"
                                            value={promoMaxBonusAmount}
                                            onChange={(event) => setPromoMaxBonusAmount(event.target.value)}
                                            disabled={promoType === "balance_credit"}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold disabled:opacity-60"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Лимит активаций"
                                            value={promoActivationLimit}
                                            onChange={(event) => setPromoActivationLimit(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="grid gap-2 text-sm text-white/65">
                                            <span>Дата начала</span>
                                            <input
                                                type="datetime-local"
                                                value={promoStartDate}
                                                onChange={(event) => setPromoStartDate(event.target.value)}
                                                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                            />
                                        </label>
                                        <label className="grid gap-2 text-sm text-white/65">
                                            <span>Дата окончания</span>
                                            <input
                                                type="datetime-local"
                                                value={promoEndDate}
                                                onChange={(event) => setPromoEndDate(event.target.value)}
                                                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                            />
                                        </label>
                                    </div>

                                    <label className="flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={promoIsActive}
                                            onChange={(event) => setPromoIsActive(event.target.checked)}
                                            className="h-4 w-4 accent-brand"
                                        />
                                        Промокод активен
                                    </label>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                        >
                                            {isPending ? "Сохраняем..." : editingPromoCode ? "Сохранить промокод" : "Создать промокод"}
                                        </button>
                                        {editingPromoCode && (
                                            <button
                                                type="button"
                                                onClick={resetPromoForm}
                                                className="h-12 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10"
                                            >
                                                Сбросить форму
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </SectionCard>

                            <SectionCard
                                title="Текущие промокоды"
                                description="Редактируй существующие промо, смотри лимиты активации и быстро отключай или удаляй старые коды."
                            >
                                {promocodes.length > 0 ? (
                                    <div className="space-y-4">
                                        {promocodes.map((promo) => (
                                            <div key={promo.code} className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-lg font-black uppercase tracking-tight">{promo.code}</div>
                                                        <div className="mt-1 text-xs text-white/45">
                                                            {promo.promo_type === "balance_credit"
                                                                ? `Начисление ${formatMoney(promo.bonus)}`
                                                                : `+${promo.bonus}% к пополнению`}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                            promo.is_active_now
                                                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                                                : promo.is_active
                                                                    ? "border-amber-500/25 bg-amber-500/10 text-amber-100"
                                                                    : "border-white/15 bg-white/5 text-white/60"
                                                        )}
                                                    >
                                                        {promo.is_active_now ? "Активен сейчас" : promo.is_active ? "Ждёт окно действия" : "Выключен"}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid gap-3 md:grid-cols-4">
                                                    <MiniStat label="От суммы" value={promo.min_amount > 0 ? formatMoney(promo.min_amount) : "Без порога"} />
                                                    <MiniStat label="До суммы" value={promo.max_amount > 0 ? formatMoney(promo.max_amount) : "Без лимита"} />
                                                    <MiniStat
                                                        label="Лимит активаций"
                                                        value={promo.activation_limit > 0 ? String(promo.activation_limit) : "∞"}
                                                    />
                                                    <MiniStat
                                                        label="Использовано"
                                                        value={String(promo.used_count ?? 0)}
                                                    />
                                                </div>

                                                <div className="mt-4 text-sm text-white/65">
                                                    {promo.promo_type === "topup_bonus"
                                                        ? `Максимальный бонус: ${promo.max_bonus_amount > 0 ? formatMoney(promo.max_bonus_amount) : "без лимита"}`
                                                        : "Балансный промокод начисляет сумму сразу после активации."}
                                                </div>
                                                <div className="mt-2 text-xs text-white/45">
                                                    Период действия: {promo.start_date ? formatDateTime(promo.start_date) : "сразу"} → {promo.end_date ? formatDateTime(promo.end_date) : "без окончания"}
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => hydratePromoForm(promo)}
                                                        className="h-11 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10"
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isPending}
                                                        onClick={() => deletePromo(promo.code)}
                                                        className="h-11 rounded-full border-2 border-red-500/25 px-5 text-xs font-bold uppercase tracking-normal text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Промокодов пока нет"
                                        description="Создай первый код слева: либо на прямое начисление баланса, либо на бонус к пополнению через ЮKassa."
                                    />
                                )}
                            </SectionCard>
                        </div>
                    </>
                ) : (
                    <AccessState
                        title="Нужен admin-доступ"
                        description="Создание и редактирование промокодов доступно только admin-аккаунту."
                    />
                )
            )}

            {isPayoutsSection && (
                canAccessPayoutsSection ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-4">
                            <MetricCard label="Активные заявки" value={String(openPayoutRequests.length)} note={formatMoney(activePayoutTotal)} />
                            <MetricCard label="История" value={String(closedPayoutRequests.length)} note={formatMoney(historyPayoutTotal)} />
                            <MetricCard label="Ожидает оплаты" value={String(openPayoutRequests.filter((request) => request.status === "approved").length)} note="Заявки уже подтверждены" />
                            <MetricCard label="Новые запросы" value={String(openPayoutRequests.filter((request) => request.status === "pending").length)} note="Требуют решения staff-команды" />
                        </div>

                        <SectionCard
                            title="Заявки на вывод"
                            description="После оплаты или отказа заявка закрывается и уходит в историю."
                        >
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPayoutView("active")}
                                    className={cn(
                                        "h-11 rounded-full border-2 px-5 text-xs font-bold uppercase tracking-normal transition",
                                        payoutView === "active"
                                            ? "border-white/30 bg-white text-black"
                                            : "border-white/15 text-white/75 hover:bg-white/10"
                                    )}
                                >
                                    Активные
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPayoutView("history")}
                                    className={cn(
                                        "h-11 rounded-full border-2 px-5 text-xs font-bold uppercase tracking-normal transition",
                                        payoutView === "history"
                                            ? "border-white/30 bg-white text-black"
                                            : "border-white/15 text-white/75 hover:bg-white/10"
                                    )}
                                >
                                    Исполненные
                                </button>
                            </div>

                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="text-xs uppercase tracking-normal text-white/40">
                                        <tr>
                                            <th className="pb-3 pr-4">ID</th>
                                            <th className="pb-3 pr-4">Партнёр</th>
                                            <th className="pb-3 pr-4">Сумма</th>
                                            <th className="pb-3 pr-4">Статус</th>
                                            <th className="pb-3 pr-4">Реквизиты</th>
                                            <th className="pb-3 pr-4">Когда</th>
                                            {canManagePartnerPayouts && <th className="pb-3 pr-4">Действия</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visiblePayoutRequests.length > 0 ? visiblePayoutRequests.map((request) => (
                                            <tr key={request.id} className="border-t border-white/10 align-top">
                                                <td className="py-3 pr-4 font-bold">#{request.id}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold">
                                                        #{request.partner_account_id} {request.partner_display_name || request.partner_email || request.partner_telegram_username || "Партнёр"}
                                                    </div>
                                                    <div className="text-xs text-white/45">{request.partner_email || request.partner_telegram_id || "Без привязки"}</div>
                                                </td>
                                                <td className="py-3 pr-4">{formatMoney(request.amount)}</td>
                                                <td className="py-3 pr-4">
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal",
                                                            getPayoutStatusTone(request.status)
                                                        )}
                                                    >
                                                        {getPayoutStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 whitespace-pre-wrap text-white/65">{request.payout_details}</td>
                                                <td className="py-3 pr-4 text-xs text-white/50">
                                                    <div>Создана: {formatDateTime(request.requested_at)}</div>
                                                    <div>Обработана: {formatDateTime(request.processed_at)}</div>
                                                </td>
                                                {canManagePartnerPayouts && (
                                                    <td className="py-3 pr-4">
                                                        {payoutView === "active" ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={isPending || request.status === "approved"}
                                                                    onClick={() => processPayoutRequest(request.id, "approved")}
                                                                    className="rounded-full border-2 border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-white/75 disabled:opacity-60"
                                                                >
                                                                    Одобрить
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    onClick={() => processPayoutRequest(request.id, "paid")}
                                                                    className="rounded-full border-2 border-emerald-500/25 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-emerald-200 disabled:opacity-60"
                                                                >
                                                                    Оплачено
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    onClick={() => processPayoutRequest(request.id, "rejected")}
                                                                    className="rounded-full border-2 border-red-500/25 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-red-200 disabled:opacity-60"
                                                                >
                                                                    Отклонить
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-white/45">Заявка закрыта</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={canManagePartnerPayouts ? 7 : 6} className="py-8 text-center text-white/50">
                                                    В этом разделе пока нет заявок.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включены ни просмотр заявок на вывод, ни их обработка."
                    />
                )
            )}

            {isModeratorsSection && (
                isAdmin ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-4">
                            <MetricCard label="Админы" value={String(adminAccounts.length)} note="Основные owner-аккаунты" />
                            <MetricCard label="Модераторы" value={String(moderatorAccounts.length)} note="Отдельные moderka-логины" />
                            <MetricCard label="Права" value={String(permissionCatalog.length)} note="Настраиваемые флаги доступа" />
                            <MetricCard label="По умолчанию" value={String(createPermissions.length)} note="Столько прав сейчас выбрано при создании" />
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                            <SectionCard
                                title="Создать moderka-аккаунт"
                                description="Отдельный email и пароль для сотрудника. Сразу ниже можно настроить точные права."
                            >
                                <form className="grid gap-4" onSubmit={submitModeratorAccount}>
                                    <input
                                        type="email"
                                        placeholder="moderator@company.com"
                                        value={createEmail}
                                        onChange={(event) => setCreateEmail(event.target.value)}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                    />
                                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                        <input
                                            type="text"
                                            placeholder="Пароль"
                                            value={createPassword}
                                            onChange={(event) => setCreatePassword(event.target.value)}
                                            className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateModeratorPassword}
                                            className="h-12 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10"
                                        >
                                            Сгенерировать пароль
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Отображаемое имя"
                                        value={createDisplayName}
                                        onChange={(event) => setCreateDisplayName(event.target.value)}
                                        className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold"
                                    />

                                    <div className="grid gap-3 rounded-2xl border-2 border-white/10 p-4">
                                        <div className="text-sm font-bold uppercase tracking-normal text-white/45">Права модератора</div>
                                        {permissionCatalog.map((permission) => (
                                            <label key={permission.key} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={createPermissions.includes(permission.key)}
                                                    onChange={() => toggleCreatePermission(permission.key)}
                                                    className="mt-1 h-4 w-4"
                                                />
                                                <span>
                                                    <span className="block text-sm font-semibold text-white">{permission.label}</span>
                                                    <span className="block text-xs text-white/50">{permission.description}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-12 uppercase tracking-normal disabled:opacity-60")}
                                    >
                                        {isPending ? "Создаём..." : "Создать аккаунт"}
                                    </button>
                                </form>
                            </SectionCard>

                            <SectionCard
                                title="Текущие модераторы"
                                description="Здесь меняются права, снимается роль или полностью удаляется отдельный staff-аккаунт."
                            >
                                {moderatorAccounts.length > 0 ? (
                                    <div className="space-y-4">
                                        {moderatorAccounts.map((user) => (
                                            <div key={user.account_id} className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-lg font-black uppercase tracking-tight">
                                                            {user.public_id ?? `#${user.account_id}`} {user.display_name || user.email || user.telegram_username || "Модератор"}
                                                        </div>
                                                        <div className="mt-1 text-xs text-white/45">{formatAdminIdentityLine(user)}</div>
                                                        <div className="mt-2 text-xs text-white/45">Создан: {formatDateTime(user.created_at)}</div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={isPending}
                                                            onClick={() => removeRole(user.account_id, "moderator")}
                                                            className="h-11 rounded-full border-2 border-white/15 px-5 text-[11px] font-bold uppercase tracking-normal text-white/75 transition hover:bg-white/10 disabled:opacity-60"
                                                        >
                                                            Снять роль
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isPending}
                                                            onClick={() => deletePortalAccount(user.account_id, "модератора")}
                                                            className="h-11 rounded-full border-2 border-red-500/25 px-5 text-[11px] font-bold uppercase tracking-normal text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                                                        >
                                                            Удалить аккаунт
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 p-4">
                                                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">Права модератора</div>
                                                    {permissionCatalog.map((permission) => (
                                                        <label key={permission.key} className="flex items-start gap-3 rounded-2xl border border-white/10 px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={user.permissions.includes(permission.key)}
                                                                onChange={() => toggleModeratorPermission(user, permission.key)}
                                                                disabled={isPending}
                                                                className="mt-1 h-4 w-4"
                                                            />
                                                            <span>
                                                                <span className="block text-sm font-semibold text-white">{permission.label}</span>
                                                                <span className="block text-xs text-white/50">{permission.description}</span>
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Модераторов пока нет"
                                        description="Создай отдельную moderka-учётку слева, и она сразу появится в этом списке."
                                    />
                                )}
                            </SectionCard>
                        </div>
                    </>
                ) : (
                    <AccessState
                        title="Нужен admin-доступ"
                        description="Создание и удаление модераторов доступно только owner-admin аккаунту."
                    />
                )
            )}

            {isNotificationsSection && (
                canViewNotifications ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-3">
                            <MetricCard label="Уведомлений" value={String(notifications.length)} note="Последние служебные события" />
                            <MetricCard label="Из Telegram" value={String(notifications.filter((item) => item.source === "telegram_bot").length)} note="Переходы и действия из бота" />
                            <MetricCard label="Свежие" value={String(notifications.filter((item) => {
                                if (!item.created_at) return false;
                                return Date.now() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000;
                            }).length)} note="За последние 24 часа" />
                        </div>

                        {isAdmin && notificationBlockCounters ? (
                            <SectionCard
                                title="Остановленные угрозы"
                                description="Только агрегированные счётчики. Домены и списки не сохраняются в логах."
                            >
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                    <MetricCard label="Реклама" value={String(notificationBlockCounters.ads)} note="Заблокированные рекламные домены" />
                                    <MetricCard label="Метрики" value={String(notificationBlockCounters.metrics)} note="Домены аналитики и метрик" />
                                    <MetricCard label="Трекинг" value={String(notificationBlockCounters.tracking)} note="Домены отслеживания" />
                                    <MetricCard label="Фишинг" value={String(notificationBlockCounters.phishing)} note="Фишинговые домены" />
                                    <MetricCard label="Мошенничество" value={String(notificationBlockCounters.fraud)} note="Мошеннические сайты и домены" />
                                </div>
                            </SectionCard>
                        ) : null}

                        <SectionCard
                            title="Лента уведомлений"
                            description="Сюда приходят реферальные, партнёрские и служебные события вместо лишних пользовательских сообщений."
                        >
                            {notifications.length > 0 ? (
                                <div className="space-y-4">
                                    {notifications.map((item) => (
                                        <div key={item.id} className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tight">{item.title}</div>
                                                    <div className="mt-1 text-xs text-white/45">
                                                        {item.code} • {formatDateTime(item.created_at)}
                                                    </div>
                                                </div>
                                                <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", getFeedTone(item.kind))}>
                                                    {item.source || "system"}
                                                </span>
                                            </div>
                                            <div className="mt-4 text-sm text-white/75 whitespace-pre-wrap">{item.message}</div>
                                            {item.details && (
                                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55 whitespace-pre-wrap">
                                                    {item.details}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Пока тихо"
                                    description="Новые уведомления появятся здесь автоматически."
                                />
                            )}
                        </SectionCard>
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включён просмотр уведомлений."
                    />
                )
            )}

            {isErrorsSection && (
                canViewSystemErrors ? (
                    <>
                        <div className="grid gap-6 xl:grid-cols-3">
                            <MetricCard label="Ошибок" value={String(systemErrors.length)} note="Последние зарегистрированные ошибки" />
                            <MetricCard label="Клиент" value={String(systemErrors.filter((item) => item.source === "website_client").length)} note="Ошибки, которые пришли с сайта" />
                            <MetricCard label="Backend" value={String(systemErrors.filter((item) => item.source === "backend").length)} note="Необработанные ошибки сервера" />
                        </div>

                        <SectionCard
                            title="Журнал ошибок"
                            description="Пользователю показывается короткое сообщение и код ошибки, а разбор остаётся здесь."
                        >
                            {systemErrors.length > 0 ? (
                                <div className="space-y-4">
                                    {systemErrors.map((item) => (
                                        <div key={item.id} className="rounded-[28px] border-2 border-red-500/20 bg-red-500/10 p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tight">{item.title}</div>
                                                    <div className="mt-1 text-xs text-white/55">
                                                        {item.code} • {formatDateTime(item.created_at)}
                                                        {item.path ? ` • ${item.path}` : ""}
                                                    </div>
                                                </div>
                                                <span className="inline-flex rounded-full border border-red-500/25 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-red-200">
                                                    {item.source || "system"}
                                                </span>
                                            </div>
                                            <div className="mt-4 text-sm text-white/80 whitespace-pre-wrap">{item.message}</div>
                                            {item.details && (
                                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/55 whitespace-pre-wrap">
                                                    {item.details}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Ошибок нет"
                                    description="Журнал пуст. Как только что-то сломается, запись появится здесь."
                                />
                            )}
                        </SectionCard>
                    </>
                ) : (
                    <AccessState
                        title="Раздел скрыт"
                        description="Для этой staff-учётки не включён просмотр ошибок."
                    />
                )
            )}
        </div>
    );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <div className="text-xs font-bold uppercase tracking-normal text-white/40">{label}</div>
            <div className="mt-4 max-w-full overflow-hidden text-4xl font-black uppercase tracking-tight [overflow-wrap:anywhere]">
                {value}
            </div>
            <div className="mt-2 text-sm text-white/55">{note}</div>
        </div>
    );
}

function UserLeadCard({
    detail,
    isLoading,
    onCopy,
    onUseForBalance,
}: {
    detail: BackendAdminUserDetail | null;
    isLoading: boolean;
    onCopy: (label: string, value: string | null | undefined) => void;
    onUseForBalance: (user: BackendAdminUser) => void;
}) {
    if (isLoading) {
        return (
            <SectionCard
                title="Карточка пользователя"
                description="Загружаю полный профиль, устройства и историю платежей."
            >
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    Собираю данные по аккаунту…
                </div>
            </SectionCard>
        );
    }

    if (!detail) {
        return (
            <EmptyState
                title="Карточка пользователя"
                description="Нажми на пользователя в таблице слева, и здесь откроется полный lead-профиль с Telegram, ключами и пополнениями."
            />
        );
    }

    const user = detail.account;
    const telegramHref = buildTelegramProfileHref(user);
    const onlineDevicesCount = detail.devices.filter((device) => device.is_online === true).length;
    const limitedDevicesCount = detail.devices.filter(
        (device) => device.limited || device.marzban_status === "disabled"
    ).length;
    const hasLiveDeviceMetrics = detail.devices.some(
        (device) => device.is_online !== null || device.traffic_total_bytes !== null || device.marzban_status !== null
    );

    return (
        <SectionCard
            title={user.public_id ?? `#${user.account_id}`}
            description="Полный lead-профиль: каналы входа, устройства, ключи доступа и история пополнений."
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="text-xl font-black uppercase tracking-tight">
                        {user.display_name || user.email || user.telegram_username || "Без имени"}
                    </div>
                    <div className="mt-2 text-sm text-white/55">{formatAdminIdentityLine(user)}</div>
                    <div className="mt-2 text-xs text-white/45">
                        Создан: {formatDateTime(user.created_at)} • Обновлён: {formatDateTime(user.updated_at)}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {telegramHref && (
                        <a
                            href={telegramHref}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(buttonVariants({ variant: "brand", size: "sm" }), "h-11 uppercase tracking-normal")}
                        >
                            Открыть Telegram
                        </a>
                    )}
                    {user.telegram_id && (
                        <button
                            type="button"
                            onClick={() => onCopy("Telegram ID", user.telegram_id)}
                            className="h-11 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10"
                        >
                            Скопировать TG ID
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onUseForBalance(user)}
                        className="h-11 rounded-full border-2 border-white/15 px-5 text-xs font-bold uppercase tracking-normal text-white/80 transition hover:bg-white/10"
                    >
                        Подставить в форму баланса
                    </button>
                </div>
            </div>

            {!telegramHref && user.telegram_id && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                    У пользователя нет публичного Telegram `@username`, поэтому открыть профиль по ссылке нельзя. Для ручной работы доступен только TG ID.
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <MiniStat label="Баланс" value={formatMoney(user.balance)} />
                <MiniStat label="Всего оплат" value={formatMoney(user.payments_total)} />
                <MiniStat label="Устройств" value={String(detail.devices.length)} />
                <MiniStat label="VPN сейчас" value={onlineDevicesCount > 0 ? "Да" : "Нет"} />
                <MiniStat label="Ключей онлайн" value={String(onlineDevicesCount)} />
                <MiniStat label="Ключей ограничено" value={String(limitedDevicesCount)} />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MiniStat label="Рефералы" value={`${detail.direct_referrals.length} / ${detail.level2_count}`} />
            </div>

            <div className="mt-6 space-y-5">
                <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">Идентичности и роли</div>
                    <div className="mt-4 grid gap-3">
                        {detail.identities.length > 0 ? detail.identities.map((identity) => (
                            <div key={identity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-white">
                                            {identity.provider === "email"
                                                ? identity.email || identity.external_id || "Email"
                                                : identity.external_username
                                                    ? `@${identity.external_username}`
                                                    : identity.external_id || identity.provider}
                                        </div>
                                        <div className="mt-1 text-xs text-white/45">
                                            {identity.provider} • Привязано: {formatDateTime(identity.linked_at)} • Последний вход: {formatDateTime(identity.last_login_at)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", identity.is_verified ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200" : "border-amber-500/25 bg-amber-500/10 text-amber-100")}>
                                            {identity.is_verified ? "Подтверждён" : "Не подтверждён"}
                                        </span>
                                        {identity.provider === "email" && (
                                            <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", identity.email_2fa_enabled ? "border-sky-500/25 bg-sky-500/10 text-sky-200" : "border-white/15 bg-white/5 text-white/60")}>
                                                {identity.email_2fa_enabled ? "2FA email" : "Без 2FA"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                                Внешних входов у аккаунта пока нет.
                            </div>
                        )}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                            Роли: <span className="font-semibold text-white">{user.roles.length > 0 ? user.roles.join(", ") : "user"}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">Устройства и ключи</div>
                    {!hasLiveDeviceMetrics && detail.devices.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100/90">
                            Live-статус и расход трафика временно недоступны: Marzban не ответил вовремя. Локальные данные ключей при этом сохранены.
                        </div>
                    )}
                    <div className="mt-4 space-y-4">
                        {detail.devices.length > 0 ? detail.devices.map((device) => (
                            <div key={device.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-white">{device.name || device.marzban_username || `Устройство #${device.id}`}</div>
                                        <div className="mt-1 text-xs text-white/45">
                                            {device.platform || "Платформа не указана"} • {device.country_label || device.country || "Страна не указана"} • Создано: {formatDateTime(device.created_at)}
                                        </div>
                                        <div className="mt-1 text-xs text-white/45">
                                            Последняя активность: {formatDateTime(device.last_seen_at)} {device.last_seen_ip ? `• IP ${device.last_seen_ip}` : ""}
                                        </div>
                                        {device.online_at && (
                                            <div className="mt-1 text-xs text-emerald-200/80">
                                                Онлайн с панели: {formatDateTime(device.online_at)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", getDeviceAccessTone(device))}>
                                            {getDeviceAccessLabel(device)}
                                        </span>
                                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", getDeviceLiveTone(device))}>
                                            {getDeviceLiveLabel(device)}
                                        </span>
                                    </div>
                                </div>

                                {(device.marzban_username || device.uuid || device.reason) && (
                                    <div className="mt-3 space-y-1 text-xs text-white/50">
                                        {device.marzban_username && <div>Логин панели: {device.marzban_username}</div>}
                                        {device.marzban_status && <div>Статус Marzban: {getMarzbanStatusLabel(device.marzban_status)}</div>}
                                        {device.uuid && <div>UUID: {device.uuid}</div>}
                                        {device.reason && <div>Причина ограничения: {device.reason}</div>}
                                    </div>
                                )}

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <MiniStat label="24 часа" value={formatTrafficBytes(device.traffic_24h_bytes)} />
                                    <MiniStat label="7 дней" value={formatTrafficBytes(device.traffic_7d_bytes)} />
                                    <MiniStat label="30 дней" value={formatTrafficBytes(device.traffic_30d_bytes)} />
                                    <MiniStat label="Всего" value={formatTrafficBytes(device.traffic_total_bytes)} />
                                </div>

                                {device.vless_link && (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="text-xs font-bold uppercase tracking-normal text-white/45">Ключ доступа</div>
                                            <button
                                                type="button"
                                                onClick={() => onCopy("Ключ доступа", device.vless_link)}
                                                className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-white/75 transition hover:bg-white/10"
                                            >
                                                Скопировать
                                            </button>
                                        </div>
                                        <div className="mt-3 break-all text-xs text-white/75">{device.vless_link}</div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                                У пользователя пока нет устройств.
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">Пополнения и платежи</div>
                    <div className="mt-4 space-y-4">
                        {detail.payments.length > 0 ? detail.payments.map((payment) => (
                            <div key={payment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-white">
                                            {payment.currency === "RUB"
                                                ? formatMoney(payment.amount)
                                                : `${payment.amount.toFixed(2)} ${payment.currency}`}
                                        </div>
                                        <div className="mt-1 text-xs text-white/45">
                                            {payment.provider} {payment.payment_method ? `• ${payment.payment_method}` : ""} • Создан: {formatDateTime(payment.created_at)}
                                        </div>
                                        <div className="mt-1 text-xs text-white/45">
                                            Начислено: {formatMoney(payment.credited_amount)} • Бонус: {formatMoney(payment.bonus_amount)}
                                            {payment.promo_code ? ` • Промокод: ${payment.promo_code}` : ""}
                                        </div>
                                    </div>
                                    <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-normal", getPaymentStatusTone(payment.status))}>
                                        {getPaymentStatusLabel(payment.status)}
                                    </span>
                                </div>

                                <div className="mt-3 text-xs text-white/50">
                                    External ID: {payment.external_payment_id}
                                    {payment.provider_payment_id ? ` • Provider ID: ${payment.provider_payment_id}` : ""}
                                </div>

                                {(payment.receipt_url || payment.confirmation_url) && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {payment.receipt_url && (
                                            <a
                                                href={payment.receipt_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-white/75 transition hover:bg-white/10"
                                            >
                                                Чек
                                            </a>
                                        )}
                                        {payment.confirmation_url && payment.status !== "succeeded" && (
                                            <a
                                                href={payment.confirmation_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-normal text-white/75 transition hover:bg-white/10"
                                            >
                                                Страница оплаты
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                                Истории платежей пока нет.
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-bold uppercase tracking-normal text-white/45">Реферальная структура</div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <MiniStat label="Прямые рефералы" value={String(detail.direct_referrals.length)} />
                        <MiniStat label="2 уровень" value={String(detail.level2_count)} />
                    </div>
                    {detail.direct_referrals.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {detail.direct_referrals.slice(0, 8).map((referral) => (
                                <div key={referral.account_id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="font-semibold text-white">
                                        {referral.public_id ?? `#${referral.account_id}`} {referral.display_name || referral.email || referral.telegram_username || "Реферал"}
                                    </div>
                                    <div className="mt-1 text-xs text-white/45">
                                        {formatAdminIdentityLine(referral)} • Баланс: {formatMoney(referral.balance)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SectionCard>
    );
}

function ServerMetricsCard({
    server,
}: {
    server: BackendAdminServer;
}) {
    return (
        <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-6">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div>
                    <div className="text-xs font-bold uppercase tracking-normal text-white/40">Сервер</div>
                    <div className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                        {server.flag} {server.label}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                        {server.code} • {server.provider} {server.public_name ? `• ${server.public_name}` : ""}
                    </div>
                </div>
                <div className="flex flex-wrap justify-start gap-2 sm:justify-self-end">
                    <span
                        className={cn(
                            "inline-flex min-h-[40px] items-center justify-center rounded-full border px-4 py-2 text-center text-[11px] font-bold uppercase tracking-normal",
                            getServerLoadTone(server.load_level),
                        )}
                    >
                        {server.load_label}
                    </span>
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="CPU" value={formatPercent(server.cpu_usage_percent)} />
                <MiniStat label="Память" value={formatPercent(server.memory_usage_percent)} />
                <MiniStat label="Онлайн" value={server.online_users === null ? "Нет данных" : String(server.online_users)} />
                <MiniStat label="Трафик сейчас" value={formatBandwidthSpeed(server.bandwidth_speed_bps)} />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Активных юзеров" value={server.active_users === null ? "Нет данных" : String(server.active_users)} />
                <MiniStat label="Всего юзеров" value={server.total_users === null ? "Нет данных" : String(server.total_users)} />
                <MiniStat label="Пик нагрузки" value={formatPercent(server.load_percent)} />
                <MiniStat label="Протоколы" value={formatProtocolList(server.available_protocols, server.default_protocol)} />
            </div>
        </div>
    );
}

function ConnectionProfileCard({
    profile,
    canManage,
    isPending,
    onToggle,
}: {
    profile: BackendAdminConnectionProfile;
    canManage: boolean;
    isPending: boolean;
    onToggle: (profile: BackendAdminConnectionProfile) => void;
}) {
    return (
        <div className="rounded-[28px] border-2 border-white/10 bg-black/20 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-bold uppercase tracking-normal text-white/40">Профиль</div>
                    <div className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                        {profile.flag ? `${profile.flag} ` : ""}{profile.client_label}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                        {profile.code} • {profile.mode} • entry: {profile.entry_server_code}
                        {profile.exit_server_code ? ` • exit: ${profile.exit_server_code}` : ""}
                        {profile.managed_server_code ? ` • panel: ${profile.managed_server_code}` : ""}
                    </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    <span
                        className={cn(
                            "inline-flex min-h-[40px] items-center justify-center rounded-full border px-4 py-2 text-center text-[11px] font-bold uppercase tracking-normal",
                            profile.is_enabled
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                : "border-red-500/25 bg-red-500/10 text-red-200",
                        )}
                    >
                        {profile.is_enabled ? "Активен" : "Выключен"}
                    </span>
                    {canManage && (
                        <button
                            type="button"
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                            onClick={() => onToggle(profile)}
                            disabled={isPending}
                        >
                            {profile.is_enabled ? "Отключить" : "Включить"}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniStat label="Сайт/бот" value={profile.is_visible_in_catalog ? "Показываем" : "Скрыт"} />
                <MiniStat label="Автовыдача" value={profile.supports_auto_provision ? "Включена" : "Ручная"} />
                <MiniStat label="Live-статус" value={profile.load_label} />
                <MiniStat label="Шаблон ключа" value={profile.key_name_template ?? "По умолчанию"} />
                <MiniStat label="Протоколы" value={formatProtocolList(profile.available_protocols, profile.default_protocol)} />
            </div>

            {profile.notes && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                    {profile.notes}
                </div>
            )}
        </div>
    );
}

function AdminInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="grid gap-2 text-sm text-white/60">
            <span className="font-semibold">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold text-white"
            />
        </label>
    );
}

function AdminSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-2 text-sm text-white/60">
            <span className="font-semibold">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 rounded-2xl border-2 border-white/15 bg-black/20 px-4 font-semibold text-white"
            >
                {children}
            </select>
        </label>
    );
}

function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-white/50">{description}</p>
            <div className="mt-6 min-w-0">{children}</div>
        </section>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <section className="rounded-[32px] border-2 border-zinc-800 bg-zinc-900/70 p-8 text-white">
            <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
            <p className="mt-3 text-sm text-white/60">{description}</p>
        </section>
    );
}

function AccessState({ title, description }: { title: string; description: string }) {
    return (
        <section className="rounded-[32px] border-2 border-red-500/25 bg-red-500/10 p-8 text-white">
            <div className="text-xs font-bold uppercase tracking-normal text-red-300">Доступ ограничен</div>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight">{title}</h2>
            <p className="mt-3 text-sm text-white/70">{description}</p>
        </section>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] font-bold uppercase tracking-normal text-white/40">{label}</div>
            <div className="mt-2 text-lg font-bold text-white">{value}</div>
        </div>
    );
}
