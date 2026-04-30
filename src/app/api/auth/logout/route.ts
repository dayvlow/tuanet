import { clearPortalSessionCookies, jsonNoStore } from "@/lib/response-security";
import { normalizePortalParam } from "@/lib/session-portal";

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const portal = normalizePortalParam(requestUrl.searchParams.get("portal"));
    const response = jsonNoStore({ success: true });
    clearPortalSessionCookies(response, portal);
    return response;
}
