import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        accountId: string;
    }>;
}

export async function GET(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { accountId } = await context.params;
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        `/admin/users/${encodeURIComponent(accountId)}`,
        {
            method: "GET",
            token: accessToken,
        },
        {},
    );

    return NextResponse.json(data, { status: backendResponse.status });
}
