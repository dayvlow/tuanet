import "server-only";

export const BACKEND_BASE_URL =
    process.env.TUANET_BACKEND_URL?.trim() || "http://127.0.0.1:8002";
