import { fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return jsonNoStore({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/account/security/email-2fa/confirm",
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

    return jsonNoStore(data);
}
