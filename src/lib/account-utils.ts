import {
    AccountBalanceInfo,
    KeyItem,
    KeyStatus,
    ProfileInfo,
    SessionItem,
} from "@/lib/account-types";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
});

function parseDate(value?: string | null) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function formatCreatedDate(value?: string | null) {
    const date = parseDate(value);
    if (!date) {
        return "Не указано";
    }

    return dateFormatter.format(date);
}

export function formatLastActive(value?: string | null) {
    const date = parseDate(value);
    if (!date) {
        return "Не использовался";
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    if (current === today) {
        return `Сегодня, ${timeFormatter.format(date)}`;
    }

    if (current === yesterday) {
        return `Вчера, ${timeFormatter.format(date)}`;
    }

    return formatCreatedDate(value);
}

export function formatBalanceUpdatedAt(value?: string | null) {
    const date = parseDate(value);
    if (!date) {
        return "Обновлено недавно";
    }

    return `Обновлено ${formatLastActive(value).toLowerCase()}`;
}

function normalizeKeyStatus(value?: string | null): KeyStatus {
    if (value === "revoked" || value === "expiring" || value === "rotating") {
        return value;
    }

    return "active";
}

export function mapProfileRecord(params: {
    fallback: ProfileInfo;
    authUser: {
        email?: string | null;
        email_confirmed_at?: string | null;
        user_metadata?: Record<string, unknown>;
    };
    record?: {
        full_name?: string | null;
        birth_date?: string | null;
        email?: string | null;
        email_verified?: boolean | null;
        two_factor_enabled?: boolean | null;
    } | null;
}): ProfileInfo {
    const { fallback, authUser, record } = params;
    const metadataName =
        typeof authUser.user_metadata?.full_name === "string"
            ? authUser.user_metadata.full_name
            : typeof authUser.user_metadata?.name === "string"
              ? authUser.user_metadata.name
              : null;

    return {
        name: record?.full_name ?? metadataName ?? fallback.name,
        birthDate: record?.birth_date ?? fallback.birthDate,
        email: authUser.email ?? record?.email ?? fallback.email,
        emailVerified: Boolean(authUser.email_confirmed_at ?? record?.email_verified ?? fallback.emailVerified),
        twoFactorEnabled: Boolean(record?.two_factor_enabled),
    };
}

export function mapBalanceRecord(record?: {
    balance_amount?: number | null;
    balance_currency?: string | null;
    balance_updated_at?: string | null;
} | null, fallback?: AccountBalanceInfo): AccountBalanceInfo {
    return {
        amount: typeof record?.balance_amount === "number" ? record.balance_amount.toLocaleString("ru-RU") : (fallback?.amount ?? "0"),
        currency: record?.balance_currency ?? fallback?.currency ?? "₽",
        updatedAt: formatBalanceUpdatedAt(record?.balance_updated_at) ?? fallback?.updatedAt ?? "Обновлено недавно",
    };
}

export function mapKeyRow(row: {
    id: string;
    name: string;
    key_type?: string | null;
    key_kind?: string | null;
    device_type?: string | null;
    region?: string | null;
    token?: string | null;
    last4?: string | null;
    created_at?: string | null;
    last_active_at?: string | null;
    status?: string | null;
    expires_at?: string | null;
    revoked_at?: string | null;
}): KeyItem {
    const status = normalizeKeyStatus(row.status);

    return {
        id: row.id,
        name: row.name,
        type:
            row.key_type === "API" || row.key_type === "Access" || row.key_type === "Device"
                ? row.key_type
                : "Device",
        keyKind: row.key_kind === "vpn_whitelist" ? "vpn_whitelist" : "vpn",
        deviceType: row.device_type ?? undefined,
        region: row.region ?? undefined,
        token: row.token ?? undefined,
        last4: row.last4 ?? "0000",
        createdAt: formatCreatedDate(row.created_at),
        lastActive: status === "revoked" && row.revoked_at ? "Только что" : formatLastActive(row.last_active_at),
        status,
        expiresAt: row.expires_at ? formatLastActive(row.expires_at).toLowerCase() : undefined,
        affectedDevices: row.device_type ? [row.device_type] : [],
    };
}

export function mapSessionRow(row: {
    id: string;
    device: string;
    location?: string | null;
    last_active_at?: string | null;
    is_current?: boolean | null;
}): SessionItem {
    return {
        id: row.id,
        device: row.device,
        location: row.location ?? "Неизвестная локация",
        lastActive: row.is_current ? "Сейчас" : formatLastActive(row.last_active_at),
        current: Boolean(row.is_current),
    };
}
