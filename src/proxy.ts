import { NextRequest, NextResponse } from "next/server";

import { buildPortalUrl, normalizeHost, resolvePortalSite } from "@/lib/portal-host";

const PUBLIC_FILE_PATTERN = /\.[^/]+$/;

const CUSTOMER_ACCOUNT_PREFIXES = [
    "/account/subscription",
    "/account/keys",
    "/account/devices",
    "/account/payments",
    "/account/security",
];

const MAIN_SITE_ONLY_PREFIXES = [
    "/pricing",
    "/download",
    "/help",
    "/refund",
    "/checkout",
];

const UNIVERSAL_ALLOWED_PREFIXES = [
    "/login",
    "/register",
    "/logout",
    "/privacy",
    "/terms",
    "/status",
    "/account/profile",
];

function isPublicFile(pathname: string): boolean {
    return PUBLIC_FILE_PATTERN.test(pathname);
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectWithinCurrentHost(request: NextRequest, pathname: string): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    return NextResponse.redirect(url);
}

function redirectToPortalHost(
    request: NextRequest,
    portal: "main" | "partner" | "admin",
): NextResponse | null {
    const currentHost = normalizeHost(request.headers.get("host"));
    const targetUrl = buildPortalUrl(
        portal,
        request.nextUrl.pathname,
        request.nextUrl.search,
        request.nextUrl.protocol,
    );
    const targetHost = normalizeHost(new URL(targetUrl).host);
    if (!targetHost || targetHost === currentHost) {
        return null;
    }
    return NextResponse.redirect(targetUrl);
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/_next")
        || pathname.startsWith("/api")
        || pathname === "/favicon.ico"
        || isPublicFile(pathname)
    ) {
        return NextResponse.next();
    }

    const site = resolvePortalSite(request.headers.get("host"));
    if (site === "local") {
        return NextResponse.next();
    }

    if (site === "main") {
        if (pathname.startsWith("/account/admin")) {
            return redirectToPortalHost(request, "admin") ?? NextResponse.next();
        }

        if (pathname.startsWith("/account/partner")) {
            return redirectToPortalHost(request, "partner") ?? NextResponse.next();
        }

        return NextResponse.next();
    }

    if (site === "admin") {
        if (pathname === "/") {
            return redirectWithinCurrentHost(request, "/login");
        }

        if (pathname === "/account") {
            return redirectWithinCurrentHost(request, "/account/admin");
        }

        if (
            pathname.startsWith("/account/partner")
            || matchesPrefix(pathname, MAIN_SITE_ONLY_PREFIXES)
            || matchesPrefix(pathname, CUSTOMER_ACCOUNT_PREFIXES)
        ) {
            return redirectWithinCurrentHost(request, "/account/admin");
        }

        if (!matchesPrefix(pathname, UNIVERSAL_ALLOWED_PREFIXES) && !pathname.startsWith("/account/admin")) {
            return redirectWithinCurrentHost(request, "/account/admin");
        }

        return NextResponse.next();
    }

    if (pathname === "/") {
        return redirectWithinCurrentHost(request, "/login");
    }

    if (pathname === "/account") {
        return redirectWithinCurrentHost(request, "/account/partner");
    }

    if (
        pathname.startsWith("/account/admin")
        || matchesPrefix(pathname, MAIN_SITE_ONLY_PREFIXES)
        || matchesPrefix(pathname, CUSTOMER_ACCOUNT_PREFIXES)
    ) {
        return redirectWithinCurrentHost(request, "/account/partner");
    }

    if (!matchesPrefix(pathname, UNIVERSAL_ALLOWED_PREFIXES) && !pathname.startsWith("/account/partner")) {
        return redirectWithinCurrentHost(request, "/login");
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/:path*",
};
