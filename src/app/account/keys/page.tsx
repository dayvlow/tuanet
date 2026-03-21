"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { KeysTable } from "@/components/account/KeysTable";
import { KeyCreateModal, KeyRevokeModal } from "@/components/account/KeyModals";
import { keysFixture, KeyItem } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Безопасность", href: "/account/security" },
    { label: "Профиль", href: "/account/profile" },
];

function KeysPageContent() {
    const searchParams = useSearchParams();
    const [keys, setKeys] = useState(keysFixture);
    const [isCreateOpen, setIsCreateOpen] = useState(() => searchParams.get("create") === "1");
    const [revokeKey, setRevokeKey] = useState<KeyItem | null>(null);
    const state = (searchParams.get("state") ?? "success") as "success" | "loading" | "empty" | "error";

    return (
        <AccountShell
            title="Ключи"
            description="Ключи подключения и управление доступом"
            quickActions={quickActions}
        >
            <KeysTable
                keys={keys}
                state={state}
                onCreate={() => setIsCreateOpen(true)}
                onRevoke={(key) => setRevokeKey(key)}
            />

            <KeyCreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreateKey={(key) => setKeys((current) => [key, ...current])}
            />
            <KeyRevokeModal
                open={Boolean(revokeKey)}
                onClose={() => setRevokeKey(null)}
                keyItem={revokeKey}
                onConfirm={(key) =>
                    setKeys((current) =>
                        current.map((item) =>
                            item.id === key.id
                                ? { ...item, status: "revoked", lastActive: "Только что", affectedDevices: [] }
                                : item
                        )
                    )
                }
            />
        </AccountShell>
    );
}

export default function KeysPage() {
    return (
        <Suspense fallback={null}>
            <KeysPageContent />
        </Suspense>
    );
}
