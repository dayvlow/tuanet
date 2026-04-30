import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

interface RouteContext {
    params: Promise<{
        deviceId: string;
    }>;
}

export async function DELETE(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { deviceId } = await context.params;

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/devices/${encodeURIComponent(deviceId)}`, {
        method: "DELETE",
        token: accessToken,
    }, {});
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
