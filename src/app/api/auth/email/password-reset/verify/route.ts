import { fetchBackendResponseJson } from "@/lib/backend-server";
import { jsonNoStore } from "@/lib/response-security";

export async function POST(request: Request) {
    const payload = await request.json();

    const { response: backendResponse, data } = await fetchBackendResponseJson<Record<string, unknown>>(
        "/auth/email/password-reset/verify",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
        {},
    );
    if (!backendResponse.ok) {
        return jsonNoStore(data, { status: backendResponse.status });
    }

    return jsonNoStore(data);
}
