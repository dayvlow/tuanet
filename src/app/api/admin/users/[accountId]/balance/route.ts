import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        accountId: string;
    }>;
}

export async function POST(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const payload = await request.json();
    const { accountId } = await context.params;

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/admin/users/${accountId}/balance`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
