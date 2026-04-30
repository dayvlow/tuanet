import { SESSION_COOKIE_NAME } from "@/lib/backend";
import { AUTH_COOKIE_SECURE, fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";
import { getPortalSessionCookieName, resolvePortalFromRequest } from "@/lib/session-portal";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const portal = resolvePortalFromRequest(request, "customer");
    const accessToken = await getRequestSessionToken(request, portal);

    if (!accessToken) {
        return jsonNoStore({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/account/delete/confirm",
        {
            method: "POST",
            token: accessToken,
            body: JSON.stringify(payload),
        },
        {},
    );
    if (!backendResponse.ok) {
        return jsonNoStore(data, { status: backendResponse.status });
    }

    const response = jsonNoStore(data);
    if (portal) {
        response.cookies.set({
            name: getPortalSessionCookieName(portal),
            value: "",
            httpOnly: true,
            sameSite: "lax",
            secure: AUTH_COOKIE_SECURE,
            path: "/",
            maxAge: 0,
        });
    }
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: AUTH_COOKIE_SECURE,
        path: "/",
        maxAge: 0,
    });
    return response;
}
