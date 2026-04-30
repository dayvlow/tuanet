import { buildDemoToken } from "@/lib/demo-backend";
import { clearPortalSessionCookies, jsonNoStore, setPortalSessionCookies } from "@/lib/response-security";

type QuickLoginKind = "admin" | "client" | "partner";

export async function POST(request: Request) {
    const payload = (await request.json().catch(() => ({}))) as { kind?: unknown };
    const kind = payload.kind === "admin" || payload.kind === "client" || payload.kind === "partner" ? payload.kind : null;

    if (!kind) {
        return jsonNoStore({ detail: "Invalid request" }, { status: 400 });
    }

    const portal = kind === "admin" ? "staff" : kind === "partner" ? "partner" : "customer";
    const token = buildDemoToken(portal);
    const response = jsonNoStore({
        success: true,
        home_path: kind === "admin" ? "/account/admin" : kind === "partner" ? "/account/partner" : "/account",
        portal,
        roles: kind === "admin" ? ["admin"] : kind === "partner" ? ["partner"] : [],
        demo: true,
    });
    clearPortalSessionCookies(response, portal);
    setPortalSessionCookies(response, portal, token);
    return response;
}
