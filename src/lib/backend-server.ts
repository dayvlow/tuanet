import "server-only";

import { BACKEND_BASE_URL } from "@/lib/backend-config";
import { buildDemoBackendResponse, isDemoToken } from "@/lib/demo-backend";

type BackendFetchOptions = RequestInit & {
    token?: string;
};

const INTERNAL_BACKEND_HEADER_NAME =
    process.env.TUANET_INTERNAL_BACKEND_HEADER?.trim() || "x-tuanet-internal-key";
const INTERNAL_BACKEND_API_KEY =
    process.env.TUANET_INTERNAL_BACKEND_API_KEY?.trim()
    || process.env.INTERNAL_BACKEND_API_KEY?.trim()
    || "";
const DEFAULT_BACKEND_TIMEOUT_MS = Number(process.env.TUANET_BACKEND_TIMEOUT_MS ?? 12000);

function parseBooleanEnv(value: string | undefined): boolean | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
        return null;
    }

    return ["1", "true", "yes", "on"].includes(normalized);
}

function getInternalBackendApiKey(): string | null {
    if (INTERNAL_BACKEND_API_KEY) {
        return INTERNAL_BACKEND_API_KEY;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("TUANET_INTERNAL_BACKEND_API_KEY is not configured");
    }

    return null;
}

function getBackendErrorDetail(payload: unknown, status: number): string {
    if (payload && typeof payload === "object" && "detail" in payload) {
        return String(payload.detail);
    }

    return `Backend request failed with status ${status}`;
}

export const AUTH_COOKIE_SECURE =
    parseBooleanEnv(process.env.TUANET_COOKIE_SECURE) ?? process.env.NODE_ENV === "production";

export async function readBackendJson<T>(response: Response, fallback: T): Promise<T> {
    const rawBody = await response.text();
    if (!rawBody) {
        return fallback;
    }

    try {
        return JSON.parse(rawBody) as T;
    } catch {
        return fallback;
    }
}

export async function fetchBackendServer(path: string, options: BackendFetchOptions = {}): Promise<Response> {
    if (isDemoToken(options.token)) {
        return buildDemoBackendResponse(path, {
            ...options,
            token: options.token,
        });
    }

    const headers = new Headers(options.headers);
    headers.set("accept", "application/json");

    if (options.body && !(options.body instanceof FormData) && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }
    if (options.token) {
        headers.set("authorization", `Bearer ${options.token}`);
    }

    const internalApiKey = getInternalBackendApiKey();
    if (internalApiKey) {
        headers.set(INTERNAL_BACKEND_HEADER_NAME, internalApiKey);
    }

    const { signal: externalSignal, ...requestOptions } = options;
    const controller = new AbortController();
    const timeoutMs = Number.isFinite(DEFAULT_BACKEND_TIMEOUT_MS) && DEFAULT_BACKEND_TIMEOUT_MS > 0
        ? DEFAULT_BACKEND_TIMEOUT_MS
        : 12000;
    const timeoutId = setTimeout(() => controller.abort("backend_timeout"), timeoutMs);
    const handleAbort = () => controller.abort(externalSignal?.reason ?? "request_aborted");

    if (externalSignal) {
        if (externalSignal.aborted) {
            handleAbort();
        } else {
            externalSignal.addEventListener("abort", handleAbort, { once: true });
        }
    }

    try {
        return await fetch(`${BACKEND_BASE_URL}${path}`, {
            ...requestOptions,
            headers,
            cache: "no-store",
            signal: controller.signal,
        });
    } catch (error) {
        if (controller.signal.aborted && !externalSignal?.aborted) {
            throw new Error(`Backend request timed out after ${timeoutMs}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener("abort", handleAbort);
    }
}

export async function fetchBackendResponseJson<T>(
    path: string,
    options: BackendFetchOptions = {},
    fallback: T,
): Promise<{ response: Response; data: T }> {
    const response = await fetchBackendServer(path, options);
    const data = await readBackendJson(response, fallback);
    return { response, data };
}

export async function fetchBackendJson<T>(path: string, options: BackendFetchOptions = {}): Promise<T> {
    const { response, data } = await fetchBackendResponseJson<unknown>(path, options, null);

    if (!response.ok) {
        throw new Error(getBackendErrorDetail(data, response.status));
    }

    return data as T;
}

interface SystemErrorReportOptions {
    title: string;
    message: string;
    code?: string;
    source?: string;
    details?: string;
    portal?: string;
    path?: string;
    relatedAccountId?: number;
}

export async function reportSystemError(options: SystemErrorReportOptions): Promise<string | null> {
    try {
        const { response, data } = await fetchBackendResponseJson<{ item?: string }>(
            "/system/errors/report",
            {
                method: "POST",
                body: JSON.stringify({
                    title: options.title,
                    message: options.message,
                    code: options.code,
                    source: options.source,
                    details: options.details,
                    portal: options.portal,
                    path: options.path,
                    related_account_id: options.relatedAccountId,
                }),
            },
            {},
        );
        if (!response.ok) {
            return null;
        }
        return data.item ?? null;
    } catch {
        return null;
    }
}
