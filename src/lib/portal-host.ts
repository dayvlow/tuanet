export type PortalSiteKind = "local" | "main" | "partner" | "admin";

const MAIN_SITE_HOST =
    process.env.TUANET_MAIN_HOST ??
    process.env.NEXT_PUBLIC_TUANET_MAIN_HOST ??
    "tuanet.online";

const PARTNER_SITE_HOST =
    process.env.TUANET_PARTNER_HOST ??
    process.env.NEXT_PUBLIC_TUANET_PARTNER_HOST ??
    "partner.tuanet.online";

const ADMIN_SITE_HOST =
    process.env.TUANET_ADMIN_HOST ??
    process.env.NEXT_PUBLIC_TUANET_ADMIN_HOST ??
    "admin.tuanet.online";

const IPV4_HOST_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export function normalizeHost(rawHost: string | null | undefined): string {
    if (!rawHost) {
        return "";
    }

    return rawHost.trim().toLowerCase().replace(/:\d+$/, "");
}

export function isLocalHost(rawHost: string | null | undefined): boolean {
    const host = normalizeHost(rawHost);
    if (!host) {
        return true;
    }

    return (
        host === "localhost"
        || host.endsWith(".localhost")
        || host === "127.0.0.1"
        || host === "::1"
        || IPV4_HOST_PATTERN.test(host)
    );
}

export function resolvePortalSite(rawHost: string | null | undefined): PortalSiteKind {
    const host = normalizeHost(rawHost);
    if (!host || isLocalHost(host)) {
        return "local";
    }

    if (host === normalizeHost(ADMIN_SITE_HOST)) {
        return "admin";
    }

    if (host === normalizeHost(PARTNER_SITE_HOST)) {
        return "partner";
    }

    return "main";
}

export function getPortalSiteHost(site: Exclude<PortalSiteKind, "local">): string {
    switch (site) {
        case "admin":
            return ADMIN_SITE_HOST;
        case "partner":
            return PARTNER_SITE_HOST;
        default:
            return MAIN_SITE_HOST;
    }
}

export function buildPortalUrl(
    site: Exclude<PortalSiteKind, "local">,
    pathname: string,
    search = "",
    protocol = "https:",
): string {
    const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${protocol}//${getPortalSiteHost(site)}${normalizedPathname}${search}`;
}
