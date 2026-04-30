import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

type RouteContext = {
    params: Promise<{ paymentRef: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    const accessToken = await getRequestSessionToken(request, "customer");
    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { paymentRef } = await context.params;
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        `/payments/topups/${encodeURIComponent(paymentRef)}`,
        {
            method: "GET",
            token: accessToken,
        },
        {},
    );

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
