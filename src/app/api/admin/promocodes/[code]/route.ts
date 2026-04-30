import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

type RouteContext = {
    params: Promise<{ code: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { code } = await context.params;
    const payload = await request.json();
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        `/admin/promocodes/${encodeURIComponent(code)}`,
        {
            method: "PATCH",
            token: accessToken,
            body: JSON.stringify(payload),
        },
        {},
    );
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { code } = await context.params;
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        `/admin/promocodes/${encodeURIComponent(code)}`,
        {
            method: "DELETE",
            token: accessToken,
        },
        {},
    );
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
