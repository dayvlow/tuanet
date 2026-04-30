import { fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function GET(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return jsonNoStore({ detail: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return jsonNoStore({ detail: "Missing token" }, { status: 400 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/link-sessions/${token}`, {
        method: "GET",
        token: accessToken,
    }, {});
    if (!backendResponse.ok) {
        return jsonNoStore(data, { status: backendResponse.status });
    }

    return jsonNoStore(data);
}
