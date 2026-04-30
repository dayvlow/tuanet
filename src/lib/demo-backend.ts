import "server-only";

import type {
    BackendAccount,
    BackendAdminMessagingOverview,
    BackendAdminOverview,
    BackendAdminPartnerApplicationsResponse,
    BackendAdminPartnerPayoutsResponse,
    BackendAdminPartnersResponse,
    BackendAdminPromocodeResponse,
    BackendAdminRoleResponse,
    BackendAdminServersResponse,
    BackendAdminUsersResponse,
    BackendDashboard,
    BackendDeviceCatalog,
    BackendDeviceList,
    BackendMyPromos,
    BackendPayments,
    BackendPartnerOverview,
    BackendPromoCatalog,
    BackendReferrals,
    BackendStaffFeedResponse,
} from "@/lib/backend";

type DemoPortal = "customer" | "partner" | "staff";

export function buildDemoToken(portal: DemoPortal): string {
    return `demo_${portal}`;
}

export function isDemoToken(token: string | undefined | null): token is string {
    return token === "demo_customer" || token === "demo_partner" || token === "demo_staff";
}

function inferDemoPortal(token: string): DemoPortal {
    if (token === "demo_staff") {
        return "staff";
    }
    if (token === "demo_partner") {
        return "partner";
    }
    return "customer";
}

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(payload), {
        ...init,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...(init?.headers ?? {}),
        },
    });
}

function nowIso(): string {
    return new Date().toISOString();
}

function buildDemoAccount(portal: DemoPortal): BackendAccount {
    const createdAt = "2026-04-01T12:00:00.000Z";
    const updatedAt = nowIso();
    const isStaff = portal === "staff";
    const isPartner = portal === "partner";

    return {
        account_id: isStaff ? 9001 : isPartner ? 7001 : 1001,
        status: "active",
        balance: isStaff || isPartner ? 0 : 499,
        referral_code: isStaff ? null : isPartner ? "PARTNER" : "DEMO",
        legacy_telegram_user_id: null,
        display_name: isStaff ? "Демо админ" : isPartner ? "Демо партнёр" : "Демо пользователь",
        birth_date: "1994-06-12",
        roles: isStaff ? ["admin"] : isPartner ? ["partner"] : [],
        portal,
        home_path: isStaff ? "/account/admin" : isPartner ? "/account/partner" : "/account",
        permissions: [],
        permission_catalog: [],
        created_at: createdAt,
        updated_at: updatedAt,
        identities: [
            {
                id: 1,
                provider: "email",
                external_id: null,
                external_username: null,
                email: isStaff ? "admin-demo@tuanet.local" : isPartner ? "partner-demo@tuanet.local" : "demo@tuanet.local",
                has_password: true,
                is_verified: true,
                email_2fa_enabled: false,
                linked_at: createdAt,
                last_login_at: updatedAt,
            },
        ],
    };
}

function buildDemoDashboard(accountId: number): BackendDashboard {
    return {
        account_id: accountId,
        status: "active",
        balance: 499,
        payments_total: 998,
        bonus_total: 120,
        bonus_available: 80,
        promo_bonus_total: 40,
        promo_bonus_available: 20,
        promo_bonus_locked: 20,
        devices_total: 3,
        devices_active: 2,
        direct_referrals: 2,
        active_promo: null,
        linked_providers: ["email", "telegram"],
    };
}

function buildDemoReferrals(accountId: number): BackendReferrals {
    return {
        account_id: accountId,
        referral_code: "DEMO",
        direct_count: 2,
        level2_count: 1,
        bonus_total: 120,
        bonus_available: 80,
        referrals: [
            {
                account_id: 2002,
                status: "active",
                balance: 199,
                payments_total: 199,
                legacy_telegram_user_id: null,
                created_at: "2026-03-20T12:00:00.000Z",
            },
            {
                account_id: 2003,
                status: "active",
                balance: 499,
                payments_total: 499,
                legacy_telegram_user_id: null,
                created_at: "2026-03-22T12:00:00.000Z",
            },
        ],
    };
}

function buildDemoDevices(accountId: number): BackendDeviceList {
    const createdAt = "2026-04-02T10:00:00.000Z";
    return {
        account_id: accountId,
        devices: [
            {
                id: 1,
                name: "MacBook Pro",
                marzban_username: "demo-macbook",
                platform: "macOS",
                country: "RU",
                uuid: "00000000-0000-0000-0000-000000000001",
                vless_link: "vless://demo@tuanet.local:443?type=tcp#TUANET-DEMO",
                is_active: true,
                limited: false,
                reason: null,
                last_seen_at: nowIso(),
                last_seen_ip: "127.0.0.1",
                created_at: createdAt,
            },
            {
                id: 2,
                name: "iPhone",
                marzban_username: "demo-iphone",
                platform: "iOS",
                country: "RU",
                uuid: "00000000-0000-0000-0000-000000000002",
                vless_link: "vless://demo@tuanet.local:443?type=tcp#TUANET-DEMO",
                is_active: true,
                limited: false,
                reason: null,
                last_seen_at: nowIso(),
                last_seen_ip: "127.0.0.1",
                created_at: createdAt,
            },
            {
                id: 3,
                name: "Windows ПК",
                marzban_username: "demo-win",
                platform: "Windows",
                country: "RU",
                uuid: "00000000-0000-0000-0000-000000000003",
                vless_link: null,
                is_active: false,
                limited: false,
                reason: null,
                last_seen_at: null,
                last_seen_ip: null,
                created_at: createdAt,
            },
        ],
    };
}

function buildDemoDeviceCatalog(): BackendDeviceCatalog {
    return {
        device_price: 99,
        platforms: [
            { id: "windows", label: "Windows" },
            { id: "macos", label: "macOS" },
            { id: "ios", label: "iOS" },
            { id: "android", label: "Android" },
            { id: "linux", label: "Linux" },
        ],
        countries: [
            { id: "nl", label: "Нидерланды", flag: "🇳🇱", load_level: "low", load_label: "Свободно", is_available: true },
            { id: "de", label: "Германия", flag: "🇩🇪", load_level: "medium", load_label: "Нормально", is_available: true },
        ],
    };
}

function buildDemoPayments(accountId: number): BackendPayments {
    return {
        account_id: accountId,
        payments: [
            {
                id: 1,
                external_payment_id: "DEMO-1001",
                provider_payment_id: null,
                provider: "demo",
                payment_method: "Банковская карта",
                status: "succeeded",
                amount: 499,
                credited_amount: 499,
                bonus_amount: 0,
                currency: "RUB",
                promo_code: null,
                confirmation_url: null,
                receipt_url: "/help#contact",
                paid_at: nowIso(),
                synced_at: nowIso(),
                created_at: "2026-03-15T10:00:00.000Z",
                updated_at: nowIso(),
            },
        ],
    };
}

function buildDemoMyPromos(accountId: number): BackendMyPromos {
    return {
        account_id: accountId,
        active_promo_code: null,
        active_promo: null,
        used_promocodes: [{ code: "WELCOME", used_at: "2026-03-15T10:00:00.000Z" }],
    };
}

function buildDemoPromoCatalog(): BackendPromoCatalog {
    return {
        promocodes: [
            {
                code: "SPRING25",
                promo_type: "topup_bonus",
                bonus: 25,
                min_amount: 199,
                max_amount: 3990,
                max_bonus_amount: 500,
                activation_limit: 500,
                used_count: 12,
                remaining_activations: 488,
                start_date: "2026-04-01T00:00:00.000Z",
                end_date: "2026-05-01T00:00:00.000Z",
                is_active: true,
                is_active_now: true,
                created_at: "2026-04-01T00:00:00.000Z",
                updated_at: nowIso(),
            },
        ],
    };
}

function buildAdminOverview(): BackendAdminOverview {
    const setting = (key: string, value: string | number | boolean) => ({
        key,
        label: key,
        description: "Демо настройка",
        type: typeof value,
        category: "demo",
        default: value,
        value,
    });

    const demoUser = (accountId: number, email: string, linkState: "linked" | "telegram_only" | "site_only" | "unlinked") => ({
        account_id: accountId,
        public_id: null,
        status: "active",
        balance: 499,
        payments_total: 998,
        bonus_available: 80,
        bonus_total: 120,
        devices_total: 3,
        legacy_telegram_user_id: null,
        display_name: `Демо #${accountId}`,
        email,
        telegram_id: null,
        telegram_username: null,
        has_site_identity: true,
        has_telegram_identity: false,
        link_state: linkState,
        link_state_label: "Демо",
        referral_code: "DEMO",
        roles: [],
        permissions: [],
        portal: "customer" as const,
        created_at: "2026-03-20T12:00:00.000Z",
        updated_at: nowIso(),
    });

    return {
        accounts_total: 1234,
        telegram_linked_total: 456,
        email_linked_total: 1000,
        devices_total: 4321,
        devices_active: 3210,
        keys_online_total: 120,
        keys_limited_total: 5,
        balance_total: 999999,
        bonus_available_total: 12345,
        payments_total: 888888,
        payments_month_total: 77777,
        support_requests_daily: 0,
        new_accounts_daily: 0,
        admins_total: 2,
        moderators_total: 4,
        partners_total: 12,
        viewer_roles: ["admin"],
        viewer_permissions: [],
        permission_catalog: [],
        recent_accounts: [
            demoUser(3001, "user1@demo.local", "site_only"),
            demoUser(3002, "user2@demo.local", "linked"),
        ],
        settings: {
            TARIFF_PER_DEVICE: setting("TARIFF_PER_DEVICE", 99),
            REF_LVL1_PERCENT: setting("REF_LVL1_PERCENT", 10),
            REF_LVL2_PERCENT: setting("REF_LVL2_PERCENT", 5),
            PARTNER_DEFAULT_LVL1_PERCENT: setting("PARTNER_DEFAULT_LVL1_PERCENT", 20),
            PARTNER_DEFAULT_LVL2_PERCENT: setting("PARTNER_DEFAULT_LVL2_PERCENT", 10),
            PROMO100_ENABLED: setting("PROMO100_ENABLED", false),
            PROMO100_START: setting("PROMO100_START", ""),
            PROMO100_END: setting("PROMO100_END", ""),
        },
    };
}

function buildAdminUsers(): BackendAdminUsersResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        users: buildAdminOverview().recent_accounts,
    };
}

function buildAdminRoles(): BackendAdminRoleResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        permission_catalog: [],
        accounts: [
            {
                ...buildAdminOverview().recent_accounts[0],
                account_id: 9001,
                email: "admin-demo@tuanet.local",
                portal: "staff",
                roles: ["admin"],
            },
        ],
    };
}

function buildAdminServers(): BackendAdminServersResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        keys_online_total: 120,
        keys_limited_total: 5,
        profiles: [
            {
                code: "fi",
                name: "finland-direct",
                public_name: "TUANET FI",
                client_label: "TUANET FI",
                flag: "🇫🇮",
                mode: "direct",
                entry_server_code: "fi",
                entry_server_name: "Finland",
                exit_server_code: null,
                exit_server_name: null,
                managed_server_code: "fi",
                managed_server_name: "Finland",
                available_protocols: ["tcp"],
                default_protocol: "tcp",
                is_enabled: true,
                is_visible_in_catalog: true,
                supports_auto_provision: true,
                load_level: "low",
                load_label: "Свободно",
                is_available: true,
            },
        ],
        servers: [
            {
                id: "nl-1",
                label: "NL-1",
                flag: "🇳🇱",
                load_level: "low",
                load_label: "Свободно",
                load_percent: 12,
                cpu_usage_percent: 8,
                memory_usage_percent: 34,
                online_users: 22,
                active_users: 18,
                total_users: 200,
                bandwidth_speed_bps: 2097152,
                is_available: true,
            },
        ],
    };
}

function buildAdminMessaging(): BackendAdminMessagingOverview {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        recipients_total: 1234,
        canonical_targets_total: 1200,
        legacy_only_targets_total: 34,
    };
}

function buildAdminPartners(): BackendAdminPartnersResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        partners: [],
    };
}

function buildAdminPayouts(): BackendAdminPartnerPayoutsResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        requests: [],
    };
}

function buildAdminApplications(): BackendAdminPartnerApplicationsResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        applications: [],
    };
}

function buildAdminPromocodes(): BackendAdminPromocodeResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        promocodes: buildDemoPromoCatalog().promocodes,
    };
}

function buildStaffFeed(kind: "notification" | "error"): BackendStaffFeedResponse {
    return {
        viewer_roles: ["admin"],
        viewer_permissions: [],
        items: [
            {
                id: kind === "notification" ? 1 : 2,
                kind,
                code: kind === "notification" ? "DEMO-NOTICE" : "DEMO-ERROR",
                title: kind === "notification" ? "Демо уведомление" : "Демо ошибка",
                message: kind === "notification"
                    ? "Это демо-данные для проверки UI."
                    : "Это демо-ошибка для проверки ленты ошибок.",
                source: "demo",
                details: null,
                portal: kind === "notification" ? "staff" : "customer",
                path: "/",
                account_id: null,
                related_account_id: null,
                resolved_at: null,
                created_at: nowIso(),
            },
        ],
    };
}

function buildPartnerOverview(accountId: number): BackendPartnerOverview {
    const createdAt = "2026-03-10T10:00:00.000Z";
    return {
        account_id: accountId,
        profile: {
            display_name: "Демо партнёр",
            level1_percent: 20,
            level2_percent: 10,
            default_payout_details: "СБП: +7 900 000-00-00 • Получатель: Демо",
            is_active: true,
        },
        links: [
            {
                id: 1,
                code: "DEMO1",
                label: "Telegram канал",
                is_active: true,
                site_referral_path: "/register?partner=DEMO1",
                telegram_referral_start: "partner_DEMO1",
                created_at: createdAt,
                updated_at: nowIso(),
                last_used_at: "2026-04-05T12:00:00.000Z",
            },
            {
                id: 2,
                code: "DEMO2",
                label: "YouTube",
                is_active: true,
                site_referral_path: "/register?partner=DEMO2",
                telegram_referral_start: "partner_DEMO2",
                created_at: createdAt,
                updated_at: nowIso(),
                last_used_at: null,
            },
        ],
        direct_count: 12,
        level2_count: 7,
        total_commission: 15234.5,
        available_commission: 8234.5,
        pending_payout_total: 2000,
        paid_payout_total: 5000,
        referrals: [
            {
                account_id: 4001,
                public_id: "usr_4001",
                display_name: "Антон",
                email: "anton@demo.local",
                telegram_id: null,
                telegram_username: null,
                level: 1,
                invited_at: "2026-03-20T10:00:00.000Z",
                earned_amount: 1999,
            },
            {
                account_id: 4002,
                public_id: "usr_4002",
                display_name: null,
                email: null,
                telegram_id: "123456",
                telegram_username: "demo_ref",
                level: 2,
                invited_at: "2026-03-28T10:00:00.000Z",
                earned_amount: 499,
            },
        ],
        payout_requests: [
            {
                id: 1,
                partner_account_id: accountId,
                amount: 2000,
                payout_details: "СБП: +7 900 000-00-00",
                status: "pending",
                admin_comment: null,
                requested_at: "2026-04-06T10:00:00.000Z",
                processed_at: null,
                processed_by_account_id: null,
            },
        ],
        viewer_roles: ["partner"],
    };
}

export function buildDemoBackendResponse(path: string, options: RequestInit & { token: string }): Response {
    const portal = inferDemoPortal(options.token);
    const account = buildDemoAccount(portal);
    const normalizedPath = path.split("?")[0];

    if (options.method && options.method !== "GET") {
        return jsonResponse({ success: true });
    }

    switch (normalizedPath) {
        case "/account/me":
            return jsonResponse(account);
        case "/dashboard/me":
            return jsonResponse(buildDemoDashboard(account.account_id));
        case "/referrals/me":
            return jsonResponse(buildDemoReferrals(account.account_id));
        case "/devices/me":
            return jsonResponse(buildDemoDevices(account.account_id));
        case "/devices/options":
            return jsonResponse(buildDemoDeviceCatalog());
        case "/payments/me":
            return jsonResponse(buildDemoPayments(account.account_id));
        case "/promos/me":
            return jsonResponse(buildDemoMyPromos(account.account_id));
        case "/promocodes/active":
            return jsonResponse(buildDemoPromoCatalog());
        case "/partner/overview":
            return jsonResponse(buildPartnerOverview(account.account_id));
        case "/admin/overview":
            return jsonResponse(buildAdminOverview());
        case "/admin/users":
            return jsonResponse(buildAdminUsers());
        case "/admin/roles":
            return jsonResponse(buildAdminRoles());
        case "/admin/servers":
            return jsonResponse(buildAdminServers());
        case "/admin/messaging":
            return jsonResponse(buildAdminMessaging());
        case "/admin/partners":
            return jsonResponse(buildAdminPartners());
        case "/admin/partner-payouts":
            return jsonResponse(buildAdminPayouts());
        case "/admin/partner-applications":
            return jsonResponse(buildAdminApplications());
        case "/admin/promocodes":
            return jsonResponse(buildAdminPromocodes());
        case "/admin/notifications":
            return jsonResponse(buildStaffFeed("notification"));
        case "/admin/system-errors":
            return jsonResponse(buildStaffFeed("error"));
        default:
            return jsonResponse({ detail: `Demo backend: ${normalizedPath} is not implemented` }, { status: 404 });
    }
}
