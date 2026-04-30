import { NextResponse } from "next/server";

import { readAdminMessagingRequestPayload } from "@/lib/admin-messaging-server";
import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const payload = await readAdminMessagingRequestPayload(request, { includeAccountRef: false });
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/admin/messaging/broadcast",
        {
            method: "POST",
            token: accessToken,
            body: JSON.stringify(payload),
        },
        {},
    );

    return NextResponse.json(data, { status: backendResponse.status });
}
