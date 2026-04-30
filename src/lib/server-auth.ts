import "server-only";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import type { BackendAccount, BackendAccountPortal } from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { appendPortalQuery, readPortalSessionToken, resolvePortalFromRequest } from "@/lib/session-portal";

export async function getSessionToken(portalHint?: BackendAccountPortal | null): Promise<string | null> {
    const cookieStore = await cookies();
    return readPortalSessionToken(cookieStore, portalHint);
}

export async function getRequestSessionToken(
    request: Request,
    fallbackPortal?: BackendAccountPortal | null,
): Promise<string | null> {
    const cookieStore = await cookies();
    const portalHint = resolvePortalFromRequest(request, fallbackPortal);
    return readPortalSessionToken(cookieStore, portalHint);
}

export async function requireSessionToken(portalHint?: BackendAccountPortal | null): Promise<string> {
    const token = await getSessionToken(portalHint);
    if (!token) {
        redirect(appendPortalQuery("/login", portalHint));
    }
    return token;
}

function isRecoverableSessionError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const message = error.message.trim();
    return (
        message === "Account not found"
        || message === "Invalid token"
        || message === "Invalid or expired token"
        || message.startsWith("Account merged into ")
    );
}

function buildSessionRecoveryHref(
    portalHint?: BackendAccountPortal | null,
    nextHref = "/",
): string {
    const logoutUrl = new URL(appendPortalQuery("/logout", portalHint), "http://localhost");
    logoutUrl.searchParams.set("next", nextHref);
    return `${logoutUrl.pathname}${logoutUrl.search}${logoutUrl.hash}`;
}

export function redirectToSessionRecovery(
    portalHint?: BackendAccountPortal | null,
    nextHref = "/",
): never {
    redirect(buildSessionRecoveryHref(portalHint, nextHref));
}

export function rethrowNavigationSignal(error: unknown): void {
    unstable_rethrow(error);
}

export async function requireSessionAccount(
    portalHint?: BackendAccountPortal | null,
): Promise<{ token: string; account: BackendAccount }> {
    const token = await requireSessionToken(portalHint);

    try {
        const account = await fetchBackendJson<BackendAccount>("/account/me", { token });
        return { token, account };
    } catch (error) {
        if (isRecoverableSessionError(error)) {
            redirectToSessionRecovery(portalHint, "/");
        }
        throw error;
    }
}
