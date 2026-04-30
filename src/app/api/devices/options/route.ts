import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function GET(request: Request) {
    const accessToken = await getRequestSessionToken(request, "customer");

    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const query = requestUrl.searchParams.toString();
    const backendPath = query ? `/devices/options?${query}` : "/devices/options";

    const { response: backendResponse, data } = await fetchBackendResponseJson(backendPath, {
        method: "GET",
        token: accessToken,
    }, {});
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
