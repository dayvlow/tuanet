import { NextResponse } from "next/server";

import { fetchBackendResponseJson } from "@/lib/backend-server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim();
    if (!email) {
        return NextResponse.json({ detail: "Missing email" }, { status: 400 });
    }

    const { response: backendResponse, data } = await fetchBackendResponseJson(`/partner-applications/status?email=${encodeURIComponent(email)}`, {
        method: "GET",
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}

export async function POST(request: Request) {
    const payload = await request.json().catch(() => ({}));

    const { response: backendResponse, data } = await fetchBackendResponseJson("/partner-applications", {
        method: "POST",
        body: JSON.stringify(payload),
    }, {});
    return NextResponse.json(data, { status: backendResponse.status });
}
