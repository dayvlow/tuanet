import { fetchBackendResponseJson } from "@/lib/backend-server";
import { clearPortalSessionCookies, jsonNoStore, setPortalSessionCookies } from "@/lib/response-security";
import { normalizePortalParam } from "@/lib/session-portal";

export async function POST(request: Request) {
    const payload = await request.json();

    const { response: backendResponse, data } = await fetchBackendResponseJson<Record<string, unknown>>("/auth/email/register", {
        method: "POST",
        body: JSON.stringify(payload),
    }, {});
    if (!backendResponse.ok) {
        return jsonNoStore(data, { status: backendResponse.status });
    }
    if (typeof data.access_token !== "string" || !data.access_token) {
        return jsonNoStore({ detail: "Invalid backend response" }, { status: 502 });
    }

    let accountSummary: Record<string, unknown> | null = null;
    try {
        const { response: accountResponse, data: accountData } = await fetchBackendResponseJson<Record<string, unknown> | null>(
            "/account/me",
            {
                token: data.access_token,
            },
            null,
        );
        if (accountResponse.ok) {
            accountSummary = accountData;
        }
    } catch {
        accountSummary = null;
    }

    const response = jsonNoStore({
        success: true,
        home_path: typeof accountSummary?.home_path === "string" ? accountSummary.home_path : null,
        portal: typeof accountSummary?.portal === "string" ? accountSummary.portal : null,
        roles: Array.isArray(accountSummary?.roles) ? accountSummary.roles : [],
    });
    const portal = normalizePortalParam(typeof accountSummary?.portal === "string" ? accountSummary.portal : null) ?? "customer";
    clearPortalSessionCookies(response, portal);
    setPortalSessionCookies(response, portal, data.access_token);
    return response;
}
