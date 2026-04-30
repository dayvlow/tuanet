import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function DELETE(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { response: backendResponse, data: payload } = await fetchBackendResponseJson("/account/identities/telegram", {
        method: "DELETE",
        token: accessToken,
    }, {});
    return NextResponse.json(payload, { status: backendResponse.status });
}
