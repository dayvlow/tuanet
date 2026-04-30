import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";
import { getRequestSessionToken } from "@/lib/server-auth";

export async function POST(request: Request) {
    const accessToken = await getRequestSessionToken(request, "staff");
    if (!accessToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { response: backendResponse, data } = await fetchBackendResponseJson(
        "/admin/promocodes",
        {
            method: "POST",
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
