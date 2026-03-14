export type KeyStatus = "active" | "revoked" | "expiring" | "rotating";

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

export interface SessionItem {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current?: boolean;
}

export interface ProfileInfo {
    name: string;
    birthDate: string;
    email: string;
    emailVerified: boolean;
}

export interface AccountBalanceInfo {
    amount: string;
    currency: string;
    updatedAt: string;
}

export const keysFixture: KeyItem[] = [
    {
        id: "key_1",
        name: "Основной ключ",
        type: "API",
        last4: "2F9A",
        createdAt: "12 янв 2026",
        lastActive: "Сегодня, 11:40",
        status: "active",
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

export const profileFixture: ProfileInfo = {
    name: "Алексей Орлов",
    birthDate: "1994-06-12",
    email: "alexey@tuaanet.com",
    emailVerified: false,
};

export const accountBalanceFixture: AccountBalanceInfo = {
    amount: "1 490",
    currency: "₽",
    updatedAt: "Обновлено сегодня, 11:40",
};
