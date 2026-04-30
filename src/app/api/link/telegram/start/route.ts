import {
    type BackendLinkSessionStart,
    TELEGRAM_BOT_USERNAME,
    buildTelegramDeepLink,
} from "@/lib/backend";
import { fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";
import { getRequestSessionToken } from "@/lib/server-auth";

function mapStartLinkError(detail: unknown): string {
    const code = String(detail ?? "");
    if (code === "link_provider_already_linked") {
        return "Этот аккаунт уже привязан к Telegram.";
    }
    if (code === "link_return_url_invalid") {
        return "Не удалось подготовить безопасный возврат на сайт. Обнови страницу и попробуй еще раз.";
    }
    return code || "Не удалось создать запрос привязки";
}

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return jsonNoStore({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({})) as {
        returnUrl?: string;
    };

    const { response: backendResponse, data } = await fetchBackendResponseJson<BackendLinkSessionStart | null>("/link-sessions/telegram/start", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
            return_url: payload.returnUrl ?? null,
        }),
    }, null);
    if (!backendResponse.ok) {
        return jsonNoStore(
            {
                ...(data && typeof data === "object" ? data : {}),
                detail: mapStartLinkError((data as { detail?: unknown } | null)?.detail),
            },
            { status: backendResponse.status },
        );
    }
    if (!data) {
        return jsonNoStore({ detail: "Invalid backend response" }, { status: 502 });
    }

    return jsonNoStore({
        ...data,
        botUsername: TELEGRAM_BOT_USERNAME,
        deepLink: buildTelegramDeepLink(data.start_parameter),
        expiresAt: data.expires_at,
    });
}
