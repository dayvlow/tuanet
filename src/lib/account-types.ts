export type KeyStatus = "active" | "revoked" | "expiring" | "rotating";

export interface KeyItem {
    id: string;
    name: string;
    type: "API" | "Device" | "Access";
    keyKind?: "vpn" | "vpn_whitelist";
    deviceType?: string;
    region?: string;
    token?: string;
    last4: string;
    createdAt: string;
    lastActive: string;
    status: KeyStatus;
    expiresAt?: string;
    deviceLimit?: number;
    sessionLimit?: number;
    affectedDevices?: string[];
}

export interface CreateKeyInput {
    deviceName: string;
    region: string;
    deviceType: string;
    keyType: "VPN" | "VPN + белые списки";
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
    twoFactorEnabled?: boolean;
}

export interface AccountBalanceInfo {
    amount: string;
    currency: string;
    updatedAt: string;
}
