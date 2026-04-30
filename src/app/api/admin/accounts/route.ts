import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const payload = await request.json();
    const { response: backendResponse, data } = await fetchBackendResponseJson("/admin/accounts", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}

export async function DELETE(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");

    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    if (!accountId) {
        return NextResponse.json({ detail: "Missing accountId" }, { status: 400 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/admin/accounts/${accountId}`, {
        method: "DELETE",
        token: accessToken,
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
