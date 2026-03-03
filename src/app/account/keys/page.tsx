"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { KeysTable } from "@/components/account/KeysTable";
import { KeyCreateModal, KeyRevokeModal } from "@/components/account/KeyModals";
import { keysFixture, KeyItem } from "@/lib/account-fixtures";

const quickActions = [
    { label: "Создать ключ", href: "/account/keys" },
    { label: "Устройства", href: "/account/devices" },
    { label: "Безопасность", href: "/account/security" },
];

function KeysPageContent() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [revokeKey, setRevokeKey] = useState<KeyItem | null>(null);
    const searchParams = useSearchParams();
    const state = (searchParams.get("state") ?? "success") as "success" | "loading" | "empty" | "error";

    useEffect(() => {
        if (searchParams.get("create") === "1") {
            setIsCreateOpen(true);
        }
    }, [searchParams]);

    return (
        <AccountShell
            title="Ключи"
            description="API keys и токены доступа"
            primaryAction={{ label: "Создать ключ", href: "/account/keys?create=1" }}
            quickActions={quickActions}
        >
            <KeysTable
                keys={keysFixture}
                state={state}
                onCreate={() => setIsCreateOpen(true)}
                onRevoke={(key) => setRevokeKey(key)}
            />

            <KeyCreateModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <KeyRevokeModal open={Boolean(revokeKey)} onClose={() => setRevokeKey(null)} keyItem={revokeKey} />
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
