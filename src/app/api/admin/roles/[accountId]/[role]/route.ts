import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        accountId: string;
        role: string;
    }>;
}

export async function DELETE(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { accountId, role } = await context.params;
    const { response: backendResponse, data } = await fetchBackendResponseJson(`/admin/roles/${accountId}/${role}`, {
        method: "DELETE",
        token: accessToken,
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
