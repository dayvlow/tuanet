import "server-only";

import { Buffer } from "node:buffer";

interface AdminMessagingMediaPayload {
    filename: string;
    content_type?: string;
    payload_base64: string;
}

export interface AdminMessagingRequestPayload {
    account_ref?: string;
    text?: string;
    media?: AdminMessagingMediaPayload;
}

function getStringField(value: FormDataEntryValue | null): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.trim();
    return normalized || null;
}

async function readMediaField(value: FormDataEntryValue | null): Promise<AdminMessagingMediaPayload | undefined> {
    if (!(value instanceof File) || value.size === 0) {
        return undefined;
    }

    const payloadBase64 = Buffer.from(await value.arrayBuffer()).toString("base64");

    return {
        filename: value.name || "attachment",
        content_type: value.type || undefined,
        payload_base64: payloadBase64,
    };
}

function getContentType(request: Request): string {
    return request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

export async function readAdminMessagingRequestPayload(
    request: Request,
    options: { includeAccountRef: boolean },
): Promise<AdminMessagingRequestPayload> {
    const contentType = getContentType(request);

    if (contentType === "application/json") {
        return await request.json() as AdminMessagingRequestPayload;
    }

    const formData = await request.formData();
    const text = getStringField(formData.get("text"));
    const media = await readMediaField(formData.get("media"));
    const payload: AdminMessagingRequestPayload = {};

    if (options.includeAccountRef) {
        payload.account_ref = getStringField(formData.get("account_ref")) ?? "";
    }
    if (text) {
        payload.text = text;
    }
    if (media) {
        payload.media = media;
    }

    return payload;
}
