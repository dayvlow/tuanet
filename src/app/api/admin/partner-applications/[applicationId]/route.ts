import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        applicationId: string;
    }>;
}

export async function PATCH(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Не выполнен вход" }, { status: 401 });
    }

    const { applicationId } = await context.params;
    const payload = await request.json().catch(() => ({}));

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/admin/partner-applications/${applicationId}`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
