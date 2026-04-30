import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        requestId: string;
    }>;
}

export async function PATCH(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");

    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await context.params;
    const payload = await request.json().catch(() => ({}));

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/admin/partner-payouts/${requestId}`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
