import { NextResponse } from "next/server";
import { AUTH_COOKIE_SECURE } from "@/lib/backend-server";
import { type BackendAccountPortal, SESSION_COOKIE_NAME } from "@/lib/backend";
import { getPortalSessionCookieName, PORTAL_SESSION_COOKIE_NAMES } from "@/lib/session-portal";

export function applyNoStoreHeaders(response: NextResponse): NextResponse {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
}

export function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
    return applyNoStoreHeaders(NextResponse.json(body, init));
}

export function clearSessionCookies(response: NextResponse): NextResponse {
    const cookieNames = [SESSION_COOKIE_NAME, ...Object.values(PORTAL_SESSION_COOKIE_NAMES)];

    for (const cookieName of cookieNames) {
        response.cookies.set({
            name: cookieName,
            value: "",
            httpOnly: true,
            sameSite: "lax",
            secure: AUTH_COOKIE_SECURE,
            path: "/",
            maxAge: 0,
        });
    }

    return response;
}

export function clearPortalSessionCookies(
    response: NextResponse,
    portal?: BackendAccountPortal | null,
): NextResponse {
    const cookieNames = portal
        ? [SESSION_COOKIE_NAME, getPortalSessionCookieName(portal)]
        : [SESSION_COOKIE_NAME, ...Object.values(PORTAL_SESSION_COOKIE_NAMES)];

    for (const cookieName of cookieNames) {
        response.cookies.set({
            name: cookieName,
            value: "",
            httpOnly: true,
            sameSite: "lax",
            secure: AUTH_COOKIE_SECURE,
            path: "/",
            maxAge: 0,
        });
    }

    return response;
}

export function setPortalSessionCookies(
    response: NextResponse,
    portal: BackendAccountPortal,
    token: string,
): NextResponse {
    const cookieBase = {
        value: token,
        httpOnly: true,
        sameSite: "lax" as const,
        secure: AUTH_COOKIE_SECURE,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    };

    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        ...cookieBase,
    });
    response.cookies.set({
        name: getPortalSessionCookieName(portal),
        ...cookieBase,
    });

    return response;
}
