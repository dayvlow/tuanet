import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "partner");

    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    const { response: backendResponse, data } = await fetchBackendResponseJson("/partner/links", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
