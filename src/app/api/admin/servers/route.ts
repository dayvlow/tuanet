import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function GET(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/admin/servers",
        {
            method: "GET",
            token: accessToken,
        },
        {},
    );

    return NextResponse.json(data, { status: backendResponse.status });
}

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
        return NextResponse.json({ detail: "Некорректный payload" }, { status: 400 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/admin/servers",
        {
            method: "POST",
            token: accessToken,
            body: JSON.stringify(payload),
        },
        {},
    );

    return NextResponse.json(data, { status: backendResponse.status });
}
