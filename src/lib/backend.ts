import { DeviceItem, PaymentItem, ProfileInfo } from "@/lib/account-fixtures";

export const SESSION_COOKIE_NAME = "tuanet_access_token";
export const TELEGRAM_BOT_USERNAME =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "tuanet_bot";

export interface BackendIdentity {
    id: number;
    provider: string;
    external_id: string | null;
    external_username: string | null;
    email: string | null;
    has_password: boolean;
    is_verified: boolean;
    email_2fa_enabled: boolean;
    linked_at: string | null;
    last_login_at: string | null;
}

export type BackendAccountPortal = "customer" | "partner" | "staff";

export interface BackendStaffPermissionDefinition {
    key: string;
    label: string;
    description: string;
}

export interface BackendAccount {
    account_id: number;
    status: string;
    balance: number;
    referral_code: string | null;
    legacy_telegram_user_id: number | null;
    display_name: string | null;
    birth_date: string | null;
    roles: string[];
    portal: BackendAccountPortal;
    home_path: string;
    permissions: string[];
    permission_catalog: BackendStaffPermissionDefinition[];
    created_at: string | null;
    updated_at: string | null;
    identities: BackendIdentity[];
}

export interface BackendDashboard {
    account_id: number;
    status: string;
    balance: number;
    payments_total: number;
    bonus_total: number;
    bonus_available: number;
    promo_bonus_total: number;
    promo_bonus_available: number;
    promo_bonus_locked: number;
    devices_total: number;
    devices_active: number;
    direct_referrals: number;
    active_promo: BackendPromo | null;
    linked_providers: string[];
}

export interface BackendDevice {
    id: number;
    name: string | null;
    marzban_username: string | null;
    platform: string | null;
    country: string | null;
    country_label?: string | null;
    connection_protocol?: string | null;
    uuid: string | null;
    vless_link: string | null;
    is_active: boolean;
    limited: boolean;
    reason: string | null;
    last_seen_at: string | null;
    last_seen_ip: string | null;
    created_at: string | null;
}

export interface BackendDeviceList {
    account_id: number;
    devices: BackendDevice[];
}

export interface BackendDevicePlatformOption {
    id: string;
    label: string;
}

export interface BackendDeviceCountryOption {
    id: string;
    label: string;
    flag: string;
    load_level: "low" | "medium" | "high" | "unknown";
    load_label: string;
    is_available: boolean;
}

export interface BackendDeviceCatalog {
    device_price: number;
    platforms: BackendDevicePlatformOption[];
    countries: BackendDeviceCountryOption[];
}

export interface BackendPayment {
    id: number;
    external_payment_id: string;
    provider_payment_id: string | null;
    provider: string;
    payment_method: string | null;
    status: string;
    amount: number;
    credited_amount: number;
    bonus_amount: number;
    currency: string;
    promo_code: string | null;
    confirmation_url: string | null;
    receipt_url: string | null;
    paid_at: string | null;
    synced_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface BackendPayments {
    account_id: number;
    payments: BackendPayment[];
}

export interface BackendReferrals {
    account_id: number;
    referral_code: string;
    direct_count: number;
    level2_count: number;
    bonus_total: number;
    bonus_available: number;
    referrals: Array<{
        account_id: number;
        status: string;
        balance: number;
        payments_total: number;
        legacy_telegram_user_id: number | null;
        created_at: string | null;
    }>;
}

export interface BackendPromo {
    code: string;
    promo_type: "topup_bonus" | "balance_credit";
    bonus: number;
    min_amount: number;
    max_amount: number;
    max_bonus_amount: number;
    activation_limit: number;
    used_count?: number;
    remaining_activations?: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    is_active_now: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface BackendMyPromos {
    account_id: number;
    active_promo_code: string | null;
    active_promo: BackendPromo | null;
    used_promocodes: Array<{
        code: string;
        used_at: string | null;
    }>;
}

export interface BackendPromoCatalog {
    promocodes: BackendPromo[];
}

export interface BackendTopupPaymentResponse {
    success: boolean;
    account_id: number;
    payment: BackendPayment;
}

export interface BackendTopupPaymentStatusResponse {
    success: boolean;
    account_id: number;
    balance: number;
    payment: BackendPayment;
}

export interface BackendLinkSessionStart {
    provider: string;
    token: string;
    start_parameter: string;
    code: string;
    status: string;
    expires_at: string;
}

export interface BackendLinkSessionStatus {
    provider: string;
    token: string;
    code: string;
    status: string;
    target_external_id: string | null;
    target_external_username: string | null;
    expires_at: string;
    used_at: string | null;
}

export interface BackendAdminUser {
    account_id: number;
    public_id: string | null;
    status: string;
    balance: number;
    payments_total: number;
    bonus_available: number;
    bonus_total: number;
    devices_total: number;
    legacy_telegram_user_id: number | null;
    display_name: string | null;
    email: string | null;
    telegram_id: string | null;
    telegram_username: string | null;
    has_site_identity: boolean;
    has_telegram_identity: boolean;
    link_state: "linked" | "telegram_only" | "site_only" | "unlinked";
    link_state_label: string;
    referral_code: string | null;
    roles: string[];
    permissions: string[];
    portal: BackendAccountPortal;
    created_at: string | null;
    updated_at: string | null;
}

export interface BackendAdminOverview {
    accounts_total: number | null;
    telegram_linked_total: number | null;
    email_linked_total: number | null;
    devices_total: number | null;
    devices_active: number | null;
    keys_online_total: number | null;
    keys_limited_total: number | null;
    balance_total: number | null;
    bonus_available_total: number | null;
    payments_total: number | null;
    payments_month_total: number | null;
    admins_total: number | null;
    moderators_total: number | null;
    partners_total: number | null;
    support_requests_daily: number | null;
    new_accounts_daily: number | null;
    viewer_roles: string[];
    viewer_permissions: string[];
    permission_catalog: BackendStaffPermissionDefinition[];
    recent_accounts: BackendAdminUser[];
    settings: Record<string, BackendAdminSetting>;
}

export interface BackendAdminSetting {
    key: string;
    label: string;
    description: string;
    type: string;
    category: string;
    default: string | number | boolean;
    value: string | number | boolean;
}

export interface BackendAdminServer {
    id: string;
    code?: string;
    label: string;
    name?: string;
    public_name?: string | null;
    flag: string;
    provider?: string;
    host?: string | null;
    reality_public_key?: string | null;
    reality_short_id?: string | null;
    reality_sni?: string | null;
    reality_port?: number | null;
    tls_sni?: string | null;
    tls_port?: number | null;
    xhttp_host?: string | null;
    xhttp_path?: string | null;
    xhttp_port?: number | null;
    available_protocols?: string[];
    default_protocol?: string | null;
    key_name_template?: string | null;
    sort_order?: number;
    load_level: "low" | "medium" | "high" | "unknown";
    load_label: string;
    load_percent: number | null;
    cpu_usage_percent: number | null;
    memory_usage_percent: number | null;
    online_users: number | null;
    active_users: number | null;
    total_users: number | null;
    bandwidth_speed_bps: number | null;
    is_enabled?: boolean;
    is_visible_in_catalog?: boolean;
    supports_auto_provision?: boolean;
    notes?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    is_available: boolean;
}

export interface BackendAdminConnectionProfile {
    code: string;
    name: string;
    sort_order?: number;
    public_name: string | null;
    client_label: string;
    flag: string | null;
    mode: string;
    label_prefix?: string | null;
    key_name_template?: string | null;
    endpoint_host?: string | null;
    reality_public_key?: string | null;
    reality_short_id?: string | null;
    reality_sni?: string | null;
    reality_port?: number | null;
    tls_sni?: string | null;
    tls_port?: number | null;
    xhttp_host?: string | null;
    xhttp_path?: string | null;
    xhttp_port?: number | null;
    entry_server_code: string | null;
    entry_server_name: string | null;
    exit_server_code: string | null;
    exit_server_name: string | null;
    managed_server_code: string | null;
    managed_server_name: string | null;
    available_protocols: string[];
    default_protocol: string | null;
    is_enabled: boolean;
    is_visible_in_catalog: boolean;
    supports_auto_provision: boolean;
    notes?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    load_level: "low" | "medium" | "high" | "unknown";
    load_label: string;
    is_available: boolean;
}

export interface BackendAdminServersResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    keys_online_total: number | null;
    keys_limited_total: number | null;
    servers: BackendAdminServer[];
    profiles: BackendAdminConnectionProfile[];
}

export interface BackendAdminMessagingOverview {
    viewer_roles: string[];
    viewer_permissions: string[];
    recipients_total: number;
    canonical_targets_total: number;
    legacy_only_targets_total: number;
}

export interface BackendAdminMessagingActionResponse {
    success: boolean;
    target_reference?: string;
    target_chat_id?: number;
    account_id?: number | null;
    recipients_total?: number;
    canonical_targets_total?: number;
    legacy_only_targets_total?: number;
    sent?: number;
    failed?: number;
    failed_chat_ids?: number[];
}

export interface BackendAdminUsersResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    users: BackendAdminUser[];
}

export interface BackendAdminUserDetailIdentity {
    id: number;
    provider: string;
    external_id: string | null;
    external_username: string | null;
    email: string | null;
    has_password: boolean;
    is_verified: boolean;
    email_2fa_enabled: boolean;
    linked_at: string | null;
    last_login_at: string | null;
}

export interface BackendAdminUserDetailDevice {
    id: number;
    name: string | null;
    marzban_username: string | null;
    platform: string | null;
    country: string | null;
    country_label?: string | null;
    uuid: string | null;
    vless_link: string | null;
    is_active: boolean;
    limited: boolean;
    reason: string | null;
    last_seen_at: string | null;
    last_seen_ip: string | null;
    created_at: string | null;
    marzban_status: string | null;
    online_at: string | null;
    is_online: boolean | null;
    traffic_24h_bytes: number | null;
    traffic_7d_bytes: number | null;
    traffic_30d_bytes: number | null;
    traffic_total_bytes: number | null;
}

export interface BackendAdminUserDetailPayment {
    id: number;
    external_payment_id: string;
    provider_payment_id: string | null;
    provider: string;
    payment_method: string | null;
    status: string;
    amount: number;
    credited_amount: number;
    bonus_amount: number;
    currency: string;
    promo_code: string | null;
    confirmation_url: string | null;
    receipt_url: string | null;
    paid_at: string | null;
    synced_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface BackendAdminUserDetail {
    account: BackendAdminUser;
    identities: BackendAdminUserDetailIdentity[];
    devices: BackendAdminUserDetailDevice[];
    payments: BackendAdminUserDetailPayment[];
    direct_referrals: BackendAdminUser[];
    level2_count: number;
    viewer_roles: string[];
    viewer_permissions: string[];
}

export interface BackendAdminRoleResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    permission_catalog: BackendStaffPermissionDefinition[];
    accounts: BackendAdminUser[];
}

export interface BackendAdminPartner {
    account_id: number;
    public_id?: string | null;
    display_name: string | null;
    email: string | null;
    telegram_id: string | null;
    telegram_username: string | null;
    level1_percent: number;
    level2_percent: number;
    default_payout_details: string | null;
    is_active: boolean;
    links_total: number;
    total_commission: number;
    available_commission: number;
    pending_payout_total: number;
    paid_payout_total: number;
}

export interface BackendAdminPartnersResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    partners: BackendAdminPartner[];
}

export interface BackendAdminPartnerPayout {
    id: number;
    partner_account_id: number;
    partner_display_name: string | null;
    partner_email: string | null;
    partner_telegram_id: string | null;
    partner_telegram_username: string | null;
    amount: number;
    payout_details: string;
    status: string;
    admin_comment: string | null;
    requested_at: string | null;
    processed_at: string | null;
    processed_by_account_id: number | null;
}

export interface BackendAdminPartnerPayoutsResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    requests: BackendAdminPartnerPayout[];
}

export interface BackendPartnerApplication {
    id: number;
    email: string;
    comment: string | null;
    status: string;
    admin_comment: string | null;
    reviewed_by_account_id: number | null;
    created_partner_account_id: number | null;
    created_at: string | null;
    reviewed_at: string | null;
    updated_at: string | null;
}

export interface BackendAdminPartnerApplicationsResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    applications: BackendPartnerApplication[];
}

export interface BackendAdminPromocodeResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    promocodes: BackendPromo[];
}

export interface BackendStaffFeedItem {
    id: number;
    kind: "notification" | "error";
    code: string;
    title: string;
    message: string;
    source: string | null;
    details: string | null;
    portal: string | null;
    path: string | null;
    account_id: number | null;
    related_account_id: number | null;
    resolved_at: string | null;
    created_at: string | null;
}

export interface BackendStaffFeedResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    items: BackendStaffFeedItem[];
}

export interface BackendSecurityBlockCounters {
    ads: number;
    metrics: number;
    tracking: number;
    phishing: number;
    fraud: number;
}

export interface BackendSecurityBlockCountersResponse {
    viewer_roles: string[];
    viewer_permissions: string[];
    counters: BackendSecurityBlockCounters;
}

export interface BackendPartnerLink {
    id: number;
    code: string;
    label: string | null;
    is_active: boolean;
    site_referral_path: string;
    telegram_referral_start: string;
    created_at: string | null;
    updated_at: string | null;
    last_used_at: string | null;
}

export interface BackendPartnerPayoutRequest {
    id: number;
    partner_account_id: number;
    amount: number;
    payout_details: string;
    status: string;
    admin_comment: string | null;
    requested_at: string | null;
    processed_at: string | null;
    processed_by_account_id: number | null;
}

export interface BackendPartnerOverview {
    account_id: number;
    profile: {
        display_name: string | null;
        level1_percent: number;
        level2_percent: number;
        default_payout_details: string | null;
        is_active: boolean;
    };
    links: BackendPartnerLink[];
    direct_count: number;
    level2_count: number;
    total_commission: number;
    available_commission: number;
    pending_payout_total: number;
    paid_payout_total: number;
    referrals: Array<{
        account_id: number;
        public_id?: string | null;
        display_name: string | null;
        email: string | null;
        telegram_id: string | null;
        telegram_username: string | null;
        level: number;
        invited_at: string | null;
        earned_amount: number;
    }>;
    payout_requests: BackendPartnerPayoutRequest[];
    viewer_roles: string[];
}

export interface AccessKeyView {
    id: string;
    name: string;
    username: string;
    platform: string;
    createdAt: string;
    lastActive: string;
    status: "ready" | "pending" | "limited" | "offline";
    value: string | null;
}

const DEVICE_APP_LINKS: Record<string, string> = {
    ios: "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690?l=ru",
    ipad: "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690?l=ru",
    macos: "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690?l=ru",
    android: "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box&hl=ru&pli=1",
    win: "https://github.com/MatsuriDayo/nekoray/releases/download/4.0.1/nekoray-4.0.1-2024-12-12-windows64.zip",
    windows: "https://github.com/MatsuriDayo/nekoray/releases/download/4.0.1/nekoray-4.0.1-2024-12-12-windows64.zip",
};

export function buildTelegramDeepLink(startParameter: string): string {
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${startParameter}`;
}

export function getTelegramIdentity(account: BackendAccount): BackendIdentity | undefined {
    return account.identities.find((identity) => identity.provider === "telegram");
}

export function getEmailIdentity(account: BackendAccount): BackendIdentity | undefined {
    return account.identities.find((identity) => identity.provider === "email");
}

export function maskEmailAddress(email: string | null | undefined): string {
    if (!email || !email.includes("@")) {
        return email ?? "Аккаунт";
    }

    const [localPart, domain] = email.split("@", 2);
    const [domainName, domainSuffix] = domain.split(".", 2);
    const maskedLocal = `${localPart.slice(0, Math.min(2, localPart.length || 1))}***`;
    const maskedDomain = `${domainName.slice(0, 1)}***`;

    if (domainSuffix) {
        return `${maskedLocal}@${maskedDomain}.${domainSuffix}`;
    }

    return `${maskedLocal}@${maskedDomain}`;
}

export function getAccountDisplayLabel(account: BackendAccount): string {
    const emailIdentity = getEmailIdentity(account);
    if (emailIdentity?.email) {
        return maskEmailAddress(emailIdentity.email);
    }

    const telegramIdentity = getTelegramIdentity(account);
    if (telegramIdentity?.external_username) {
        return `@${telegramIdentity.external_username}`;
    }

    if (telegramIdentity?.external_id) {
        return `Telegram ${telegramIdentity.external_id}`;
    }

    return `Аккаунт #${account.account_id}`;
}

export function hasAccountRole(account: BackendAccount | null, role: string): boolean {
    return Boolean(account?.roles?.includes(role));
}

export function getAccountHomePath(account: Pick<BackendAccount, "home_path" | "portal" | "roles">): string {
    if (account.home_path) {
        return account.home_path;
    }
    if (account.portal === "staff" || account.roles.includes("admin") || account.roles.includes("moderator")) {
        return "/account/admin";
    }
    if (account.portal === "partner" || account.roles.includes("partner")) {
        return "/account/partner";
    }
    return "/account";
}

export function hasAccountPermission(account: BackendAccount | null, permission: string): boolean {
    return Boolean(account?.permissions?.includes(permission) || account?.roles?.includes("admin"));
}

function formatDate(value: string | null, dateStyle: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }): string {
    if (!value) {
        return "Нет данных";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Нет данных";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        ...dateStyle,
        timeZone: "Europe/Moscow",
    }).format(date);
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "Нет данных";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Нет данных";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Moscow",
    }).format(date);
}

function normalizePlatform(platform: string | null): DeviceItem["platform"] {
    const normalized = (platform ?? "").trim().toLowerCase();
    if (normalized.includes("mac")) {
        return "macOS";
    }
    if (normalized.includes("ios")) {
        return "iOS";
    }
    if (normalized.includes("android")) {
        return "Android";
    }
    if (normalized.includes("linux")) {
        return "Linux";
    }
    return "Windows";
}

export function normalizePlatformId(platform: string | null): string {
    const normalized = (platform ?? "").trim().toLowerCase();
    if (normalized.includes("mac")) {
        return "macos";
    }
    if (normalized.includes("ipad")) {
        return "ipad";
    }
    if (normalized.includes("ios") || normalized.includes("iphone")) {
        return "ios";
    }
    if (normalized.includes("android")) {
        return "android";
    }
    if (normalized.includes("win")) {
        return "windows";
    }
    return normalized || "windows";
}

export function getInstructionHref(platform: string | null): string {
    const normalized = normalizePlatformId(platform);
    if (normalized === "ios" || normalized === "ipad" || normalized === "macos") {
        return "/download/ios";
    }
    if (normalized === "android") {
        return "/download/android";
    }
    return "/download/windows";
}

export function getAppDownloadHref(platform: string | null): string {
    const normalized = normalizePlatformId(platform);
    return DEVICE_APP_LINKS[normalized] ?? DEVICE_APP_LINKS.windows;
}

const ALLOWED_INSTALL_CONFIG_PROTOCOLS = new Set(["vless:", "vmess:", "trojan:", "ss:"]);

export function normalizeInstallConfigHref(rawHref: string | null | undefined): string | null {
    const candidate = rawHref?.trim();
    if (!candidate) {
        return null;
    }

    try {
        const url = new URL(candidate);
        if (!ALLOWED_INSTALL_CONFIG_PROTOCOLS.has(url.protocol)) {
            return null;
        }
        return url.toString();
    } catch {
        return null;
    }
}

export function getConfigInstallHref(vlessLink: string | null, platform: string | null = null): string | null {
    const normalizedConfigHref = normalizeInstallConfigHref(vlessLink);
    if (!normalizedConfigHref) {
        return null;
    }
    const query = new URLSearchParams({
        config: normalizedConfigHref,
    });
    if (platform) {
        query.set("platform", normalizePlatformId(platform));
    }
    return `/connect?${query.toString()}`;
}

export function getCountryLabel(country: string | null): string {
    const normalized = (country ?? "").trim().toLowerCase();
    if (normalized === "de") {
        return "🇩🇪 Германия";
    }
    if (normalized === "nl") {
        return "🇳🇱 Нидерланды";
    }
    return country || "Не указана";
}

export function getQrCodeUrl(value: string | null): string | null {
    if (!value) {
        return null;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?format=svg&size=540x540&ecc=H&qzone=4&margin=0&color=111111&bgcolor=ffffff&data=${encodeURIComponent(value)}`;
}

export function mapBackendDevice(device: BackendDevice): DeviceItem {
    return {
        id: String(device.id),
        name: device.name ?? device.marzban_username ?? `Устройство ${device.id}`,
        platform: normalizePlatform(device.platform),
        location: device.country ?? device.last_seen_ip ?? "Локация не указана",
        connectedAt: formatDate(device.created_at),
        lastActive: formatDateTime(device.last_seen_at ?? device.created_at),
        keyLabel: device.marzban_username
            ? `ID подключения • ${device.marzban_username}`
            : "Доступ TUANET",
        status: device.is_active ? "active" : device.limited ? "revoked" : "offline",
    };
}

export function mapBackendPayment(payment: BackendPayment): PaymentItem {
    const normalizedStatus = payment.status.toLowerCase();
    const status: PaymentItem["status"] =
        normalizedStatus === "succeeded"
            ? "paid"
            : normalizedStatus === "refunded"
                ? "refunded"
                : normalizedStatus === "pending"
                    ? "pending"
                    : "failed";

    return {
        id: payment.external_payment_id,
        date: formatDate(payment.created_at),
        amount: `${payment.amount.toFixed(2)} ₽`,
        method: payment.payment_method ?? payment.provider,
        status,
        invoiceUrl: payment.receipt_url ?? payment.confirmation_url ?? "/help#contact",
    };
}

export function mapDeviceToAccessKey(device: BackendDevice): AccessKeyView {
    let status: AccessKeyView["status"] = "offline";
    if (device.limited) {
        status = "limited";
    } else if (!device.vless_link) {
        status = "pending";
    } else if (device.is_active) {
        status = "ready";
    }

    return {
        id: String(device.id),
        name: device.name ?? device.marzban_username ?? `Устройство ${device.id}`,
        username: device.marzban_username ?? "Не назначен",
        platform: device.platform ?? "Не указана",
        createdAt: formatDate(device.created_at),
        lastActive: formatDateTime(device.last_seen_at ?? device.created_at),
        status,
        value: device.vless_link ?? null,
    };
}

export function buildProfileInfo(account: BackendAccount): ProfileInfo {
    const emailIdentity = getEmailIdentity(account);
    const telegramIdentity = getTelegramIdentity(account);
    const email = emailIdentity?.email ?? "";
    const name = account.display_name
        ?? (telegramIdentity?.external_username
            ? `@${telegramIdentity.external_username}`
            : email
                ? email.split("@")[0]
                : `account_${account.account_id}`);

    return {
        name,
        birthDate: account.birth_date ?? "",
        email,
        emailVerified: emailIdentity?.is_verified ?? false,
    };
}
