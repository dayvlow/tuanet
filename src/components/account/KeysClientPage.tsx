"use client";

import { useMemo, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { KeyCreateModal, KeyRevokeModal } from "@/components/account/KeyModals";
import { KeysTable, ModuleState } from "@/components/account/KeysTable";
import { createClient } from "@/lib/supabase/client";
import { CreateKeyInput, KeyItem } from "@/lib/account-types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mapKeyRow } from "@/lib/account-utils";

const quickActions = [
    { label: "Безопасность", href: "/account/security" },
    { label: "Профиль", href: "/account/profile" },
];

interface KeysClientPageProps {
    initialKeys: KeyItem[];
    initialState: ModuleState;
    initialCreateOpen?: boolean;
}

function makeToken() {
    return `tua_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function KeysClientPage({
    initialKeys,
    initialState,
    initialCreateOpen = false,
}: KeysClientPageProps) {
    const [keys, setKeys] = useState(initialKeys);
    const [state, setState] = useState<ModuleState>(initialState);
    const [isCreateOpen, setIsCreateOpen] = useState(initialCreateOpen);
    const [revokeKey, setRevokeKey] = useState<KeyItem | null>(null);
    const supabase = useMemo(
        () => (isSupabaseConfigured() ? createClient() : null),
        []
    );

    async function handleCreateKey(input: CreateKeyInput) {
        const client = supabase;
        const normalizedName = input.deviceName.trim() || `${input.deviceType} ${input.region}`;
        const token = makeToken();
        const last4 = token.slice(-4).toUpperCase();

        if (!client) {
            const localKey: KeyItem = {
                id: crypto.randomUUID(),
                name: normalizedName,
                type: input.keyType === "VPN" ? "Device" : "API",
                keyKind: input.keyType === "VPN" ? "vpn" : "vpn_whitelist",
                deviceType: input.deviceType,
                region: input.region,
                token,
                last4,
                createdAt: "Сегодня",
                lastActive: "Не использовался",
                status: "active",
                affectedDevices: [input.deviceType],
            };

            setKeys((current) => [localKey, ...current]);
            setState("success");
            return localKey;
        }

        const { data, error } = await client
            .from("account_keys")
            .insert({
                name: normalizedName,
                region: input.region,
                device_type: input.deviceType,
                key_kind: input.keyType === "VPN" ? "vpn" : "vpn_whitelist",
                key_type: input.keyType === "VPN" ? "Device" : "API",
                token,
                last4,
                status: "active",
            })
            .select("id, name, key_type, key_kind, device_type, region, token, last4, created_at, last_active_at, status, expires_at, revoked_at")
            .single();

        if (error || !data) {
            setState("error");
            throw new Error(error?.message ?? "Не удалось создать ключ.");
        }

        const mapped = mapKeyRow(data);
        setKeys((current) => [mapped, ...current]);
        setState("success");
        return mapped;
    }

    async function handleRevokeKey(key: KeyItem) {
        const client = supabase;

        if (!client) {
            setKeys((current) =>
                current.map((item) =>
                    item.id === key.id
                        ? { ...item, status: "revoked", lastActive: "Только что", affectedDevices: [] }
                        : item
                )
            );
            setState("success");
            return;
        }

        const { error } = await client
            .from("account_keys")
            .update({
                status: "revoked",
                revoked_at: new Date().toISOString(),
            })
            .eq("id", key.id);

        if (error) {
            setState("error");
            throw new Error(error.message);
        }

        setKeys((current) =>
            current.map((item) =>
                item.id === key.id
                    ? { ...item, status: "revoked", lastActive: "Только что", affectedDevices: [] }
                    : item
            )
        );
        setState("success");
    }

    return (
        <AccountShell
            title="Ключи"
            description="Ключи подключения и управление доступом"
            quickActions={quickActions}
        >
            <KeysTable
                keys={keys}
                state={state === "success" && keys.length === 0 ? "empty" : state}
                onCreate={() => setIsCreateOpen(true)}
                onRevoke={(key) => setRevokeKey(key)}
            />

            <KeyCreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreateKey={handleCreateKey}
            />
            <KeyRevokeModal
                open={Boolean(revokeKey)}
                onClose={() => setRevokeKey(null)}
                keyItem={revokeKey}
                onConfirm={handleRevokeKey}
            />
        </AccountShell>
    );
}
