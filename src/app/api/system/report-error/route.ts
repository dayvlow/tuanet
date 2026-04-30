import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";

export async function POST(request: Request) {
    const payload = await request.json().catch(() => ({}));

    const { response, data } = await fetchBackendResponseJson(
        "/system/errors/report",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
        {},
    );

    return NextResponse.json(data, { status: response.status });
}
