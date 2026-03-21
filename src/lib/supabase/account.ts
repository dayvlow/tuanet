import { accountBalanceFixture, keysFixture, profileFixture, sessionsFixture } from "@/lib/account-fixtures";
import { mapBalanceRecord, mapKeyRow, mapProfileRecord, mapSessionRow } from "@/lib/account-utils";
import { AccountBalanceInfo, KeyItem, ProfileInfo, SessionItem } from "@/lib/account-types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AccountDataResult {
    profile: ProfileInfo;
    balance: AccountBalanceInfo;
    keys: KeyItem[];
    sessions: SessionItem[];
    errors: {
        profile?: string;
        keys?: string;
        sessions?: string;
        balance?: string;
    };
}

function isMissingTableError(message?: string | null, code?: string | null) {
    return code === "42P01" || message?.toLowerCase().includes("relation") || false;
}

export async function getAccountData(): Promise<AccountDataResult> {
    const fallback: AccountDataResult = {
        profile: profileFixture,
        balance: accountBalanceFixture,
        keys: keysFixture,
        sessions: sessionsFixture,
        errors: {},
    };

    if (!isSupabaseConfigured()) {
        return fallback;
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return fallback;
    }

    const upsertProfile = {
        user_id: user.id,
        full_name:
            typeof user.user_metadata.full_name === "string"
                ? user.user_metadata.full_name
                : typeof user.user_metadata.name === "string"
                  ? user.user_metadata.name
                  : profileFixture.name,
        email: user.email ?? profileFixture.email,
        email_verified: Boolean(user.email_confirmed_at),
    };

    const { error: ensureProfileError } = await supabase
        .from("account_profiles")
        .upsert(upsertProfile, { onConflict: "user_id" });

    const [profileResult, keysResult, sessionsResult] = await Promise.all([
        supabase
            .from("account_profiles")
            .select("full_name, birth_date, email, email_verified, two_factor_enabled, balance_amount, balance_currency, balance_updated_at")
            .eq("user_id", user.id)
            .maybeSingle(),
        supabase
            .from("account_keys")
            .select("id, name, key_type, key_kind, device_type, region, token, last4, created_at, last_active_at, status, expires_at, revoked_at")
            .order("created_at", { ascending: false }),
        supabase
            .from("account_sessions")
            .select("id, device, location, last_active_at, is_current")
            .order("is_current", { ascending: false })
            .order("last_active_at", { ascending: false }),
    ]);

    let sessionRows = sessionsResult.data ?? [];
    if (!sessionsResult.error && sessionRows.length === 0) {
        const { data: insertedSession } = await supabase
            .from("account_sessions")
            .insert({
                device: "Текущий браузер",
                location: "Текущая сессия",
                is_current: true,
            })
            .select("id, device, location, last_active_at, is_current");

        sessionRows = insertedSession ?? [];
    }

    const profileRow = profileResult.data ?? null;
    const profile = mapProfileRecord({
        fallback: profileFixture,
        authUser: user,
        record: profileRow,
    });
    const balance = mapBalanceRecord(profileRow, accountBalanceFixture);

    return {
        profile,
        balance,
        keys:
            keysResult.error && !isMissingTableError(keysResult.error.message, keysResult.error.code)
                ? []
                : (keysResult.data ?? []).map(mapKeyRow),
        sessions:
            sessionsResult.error && !isMissingTableError(sessionsResult.error.message, sessionsResult.error.code)
                ? []
                : sessionRows.map(mapSessionRow),
        errors: {
            profile:
                ensureProfileError?.message ||
                (profileResult.error && !isMissingTableError(profileResult.error.message, profileResult.error.code)
                    ? profileResult.error.message
                    : undefined),
            balance:
                profileResult.error && !isMissingTableError(profileResult.error.message, profileResult.error.code)
                    ? profileResult.error.message
                    : undefined,
            keys:
                keysResult.error && !isMissingTableError(keysResult.error.message, keysResult.error.code)
                    ? keysResult.error.message
                    : undefined,
            sessions:
                sessionsResult.error && !isMissingTableError(sessionsResult.error.message, sessionsResult.error.code)
                    ? sessionsResult.error.message
                    : undefined,
        },
    };
}
