import type { BackendAccountPortal } from "@/lib/backend";
import { SESSION_COOKIE_NAME } from "@/lib/backend";

type CookieStoreLike = {
    get(name: string): { value: string } | undefined;
};

export const PORTAL_SESSION_COOKIE_NAMES: Record<BackendAccountPortal, string> = {
    customer: "tuanet_access_token_customer",
    partner: "tuanet_access_token_partner",
    staff: "tuanet_access_token_staff",
};

export function normalizePortalParam(value: string | null | undefined): BackendAccountPortal | null {
    const normalized = (value ?? "").trim().toLowerCase();
    if (!normalized) {
        return null;
    }

    if (["customer", "user", "main"].includes(normalized)) {
        return "customer";
    }

    if (normalized === "partner") {
        return "partner";
    }

    if (["staff", "admin", "moderator"].includes(normalized)) {
        return "staff";
    }

    return null;
}

export function getPortalSessionCookieName(portal: BackendAccountPortal): string {
    return PORTAL_SESSION_COOKIE_NAMES[portal];
}

export function readPortalSessionToken(
    cookieStore: CookieStoreLike,
    portal: BackendAccountPortal | null | undefined,
): string | null {
    if (portal) {
        return (
            cookieStore.get(getPortalSessionCookieName(portal))?.value
            ?? cookieStore.get(SESSION_COOKIE_NAME)?.value
            ?? null
        );
    }

    const availablePortalTokens = (Object.values(PORTAL_SESSION_COOKIE_NAMES))
        .map((cookieName) => cookieStore.get(cookieName)?.value ?? null)
        .filter((token): token is string => Boolean(token));

    if (availablePortalTokens.length === 1) {
        return availablePortalTokens[0];
    }

    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function listPortalSessionTokens(
    cookieStore: CookieStoreLike,
    portalHint?: BackendAccountPortal | null,
): string[] {
    const portals = portalHint
        ? [portalHint, ...((["customer", "partner", "staff"] as BackendAccountPortal[]).filter((portal) => portal !== portalHint))]
        : (["customer", "partner", "staff"] as BackendAccountPortal[]);

    return portals
        .map((portal) => cookieStore.get(getPortalSessionCookieName(portal))?.value ?? null)
        .filter((token): token is string => Boolean(token));
}

export function inferPortalFromPathname(pathname: string): BackendAccountPortal | null {
    if (pathname.startsWith("/account/admin") || pathname.startsWith("/api/admin")) {
        return "staff";
    }

    if (pathname.startsWith("/account/partner") || pathname.startsWith("/api/partner")) {
        return "partner";
    }

    if (
        pathname.startsWith("/account")
        || pathname.startsWith("/api/account")
        || pathname.startsWith("/api/devices")
        || pathname.startsWith("/api/payments")
        || pathname.startsWith("/api/promos")
        || pathname.startsWith("/api/referrals")
        || pathname.startsWith("/api/link")
    ) {
        return "customer";
    }

    return null;
}

export function resolvePortalFromRequest(
    request: Request,
    fallbackPortal?: BackendAccountPortal | null,
): BackendAccountPortal | null {
    const requestUrl = new URL(request.url);
    const directPortal = normalizePortalParam(requestUrl.searchParams.get("portal"));
    if (directPortal) {
        return directPortal;
    }

    const pathnamePortal = inferPortalFromPathname(requestUrl.pathname);

    const referer = request.headers.get("referer");
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const refererPortal = normalizePortalParam(refererUrl.searchParams.get("portal"));
            if (refererPortal) {
                return refererPortal;
            }

            const refererPathPortal = inferPortalFromPathname(refererUrl.pathname);
            if (refererPathPortal) {
                return refererPathPortal;
            }
        } catch {
            // Ignore malformed Referer and continue with pathname fallback.
        }
    }

    return pathnamePortal ?? fallbackPortal ?? null;
}

export function appendPortalQuery(href: string, portal?: BackendAccountPortal | null): string {
    if (!portal || !href.startsWith("/")) {
        return href;
    }

    const url = new URL(href, "http://localhost");
    url.searchParams.set("portal", portal);
    return `${url.pathname}${url.search}${url.hash}`;
}

export function getPortalLoginRedirectHref(portal: BackendAccountPortal): string {
    switch (portal) {
        case "partner":
            return appendPortalQuery("/account/partner", "partner");
        case "staff":
            return appendPortalQuery("/account/admin", "staff");
        default:
            return appendPortalQuery("/account/profile", "customer");
    }
}
