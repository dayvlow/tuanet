import { fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return jsonNoStore({ detail: "Unauthorized" }, { status: 401 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/account/delete/request",
        {
            method: "POST",
            token: accessToken,
        },
        {},
    );
    if (!backendResponse.ok) {
        return jsonNoStore(data, { status: backendResponse.status });
    }

    return jsonNoStore(data);
}
