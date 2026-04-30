import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function GET(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/admin/messaging",
        {
            method: "GET",
            token: accessToken,
        },
        {},
    );

    return NextResponse.json(data, { status: backendResponse.status });
}
