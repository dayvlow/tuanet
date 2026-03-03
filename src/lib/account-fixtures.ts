export type KeyStatus = "active" | "revoked" | "expiring" | "rotating";
export type SubscriptionStatus = "active" | "expiring" | "canceled" | "none";

export interface KeyItem {
    id: string;
    name: string;
    type: "API" | "Device" | "Access";
    last4: string;
    createdAt: string;
    lastActive: string;
    status: KeyStatus;
    expiresAt?: string;
    deviceLimit?: number;
    sessionLimit?: number;
    affectedDevices?: string[];
}

export interface DeviceItem {
    id: string;
    name: string;
    platform: "Windows" | "macOS" | "iOS" | "Android" | "Linux";
    location?: string;
    connectedAt: string;
    lastActive: string;
    keyLabel: string;
    status: "active" | "offline" | "revoked";
}

export interface PaymentItem {
    id: string;
    date: string;
    amount: string;
    method: string;
    status: "paid" | "refunded" | "failed";
    invoiceUrl?: string;
}

export interface SessionItem {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current?: boolean;
}

export interface SubscriptionInfo {
    plan: "Неделя" | "Месяц" | "Год";
    status: SubscriptionStatus;
    renewAt: string;
    endsAt: string;
    autoRenew: boolean;
    deviceLimit: number;
}

export interface ProfileInfo {
    name: string;
    birthDate: string;
    email: string;
    emailVerified: boolean;
}

export interface NotificationPrefs {
    expiring: boolean;
    newDevice: boolean;
    keyRotation: boolean;
}

// Assumption: лимит устройств по умолчанию 5 для всех планов.
export const deviceLimit = 5;

// Assumption: цены и планы используются как плейсхолдеры для UI.
export const plans = [
    { id: "week", label: "Неделя", price: "199 ₽" },
    { id: "month", label: "Месяц", price: "499 ₽" },
    { id: "year", label: "Год", price: "3 990 ₽" },
];

export const keysFixture: KeyItem[] = [
    {
        id: "key_1",
        name: "Основной ключ",
        type: "API",
        last4: "2F9A",
        createdAt: "12 янв 2026",
        lastActive: "Сегодня, 11:40",
        status: "active",
        deviceLimit: 5,
        sessionLimit: 10,
        affectedDevices: ["MacBook Pro", "iPhone 15"],
    },
    {
        id: "key_2",
        name: "Ноутбук",
        type: "Device",
        last4: "7C31",
        createdAt: "05 дек 2025",
        lastActive: "Вчера, 21:10",
        status: "rotating",
        expiresAt: "через 10 минут",
        affectedDevices: ["Windows ПК"],
    },
    {
        id: "key_3",
        name: "Старый токен",
        type: "Access",
        last4: "9B77",
        createdAt: "12 июл 2025",
        lastActive: "30 окт 2025",
        status: "revoked",
    },
];

export const devicesFixture: DeviceItem[] = [
    {
        id: "dev_1",
        name: "MacBook Pro",
        platform: "macOS",
        location: "Москва, RU",
        connectedAt: "12 янв 2026",
        lastActive: "Сегодня, 11:40",
        keyLabel: "Основной ключ • 2F9A",
        status: "active",
    },
    {
        id: "dev_2",
        name: "iPhone 15",
        platform: "iOS",
        location: "Москва, RU",
        connectedAt: "08 янв 2026",
        lastActive: "Сегодня, 09:15",
        keyLabel: "Основной ключ • 2F9A",
        status: "active",
    },
    {
        id: "dev_3",
        name: "Windows ПК",
        platform: "Windows",
        location: "Санкт-Петербург, RU",
        connectedAt: "02 янв 2026",
        lastActive: "Вчера, 21:10",
        keyLabel: "Ноутбук • 7C31",
        status: "offline",
    },
];

export const paymentsFixture: PaymentItem[] = [
    {
        id: "pay_1",
        date: "15 фев 2026",
        amount: "499 ₽",
        method: "Банковская карта",
        status: "paid",
        invoiceUrl: "/help#contact",
    },
    {
        id: "pay_2",
        date: "15 янв 2026",
        amount: "499 ₽",
        method: "Банковская карта",
        status: "paid",
        invoiceUrl: "/help#contact",
    },
];

export const sessionsFixture: SessionItem[] = [
    {
        id: "session_1",
        device: "MacBook Pro",
        location: "Москва, RU",
        lastActive: "Сейчас",
        current: true,
    },
    {
        id: "session_2",
        device: "iPhone 15",
        location: "Москва, RU",
        lastActive: "Сегодня, 09:15",
    },
    {
        id: "session_3",
        device: "Windows ПК",
        location: "Санкт-Петербург, RU",
        lastActive: "Вчера, 21:10",
    },
];

export const subscriptionFixture: SubscriptionInfo = {
    plan: "Месяц",
    status: "active",
    renewAt: "15 марта 2026",
    endsAt: "15 марта 2026",
    autoRenew: true,
    deviceLimit,
};

export const profileFixture: ProfileInfo = {
    name: "Алексей Орлов",
    birthDate: "1994-06-12",
    email: "alexey@tuaanet.com",
    emailVerified: false,
};

export const notificationFixture: NotificationPrefs = {
    expiring: true,
    newDevice: true,
    keyRotation: true,
};
