"use client";

export interface ClientIssueOptions {
    title: string;
    message: string;
    source?: string;
    details?: string;
    portal?: string;
    path?: string;
    relatedAccountId?: number;
}

export async function reportClientIssue(options: ClientIssueOptions): Promise<string | null> {
    try {
        const response = await fetch("/api/system/report-error", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                title: options.title,
                message: options.message,
                source: options.source ?? "website_client",
                details: options.details,
                portal: options.portal,
                path: options.path,
                related_account_id: options.relatedAccountId,
            }),
        });
        const payload = (await response.json().catch(() => ({}))) as { item?: string };
        return response.ok ? payload.item ?? null : null;
    } catch {
        return null;
    }
}
