import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { buildPortalUrl } from "@/lib/portal-host";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");
    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const returnUrl = buildPortalUrl("main", "/account/payments", "?portal=customer", "https:");

    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/payments/topups",
        {
            method: "POST",
            token: accessToken,
            body: JSON.stringify({
                ...payload,
                return_url: returnUrl,
            }),
        },
        {},
    );

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
