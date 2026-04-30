import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { type BackendAccount, type BackendAccountPortal } from "@/lib/backend";
import { fetchBackendJson } from "@/lib/backend-server";
import { PortalSiteKind, resolvePortalSite } from "@/lib/portal-host";
import { getSessionToken, rethrowNavigationSignal } from "@/lib/server-auth";
import { getPortalLoginRedirectHref } from "@/lib/session-portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface RegisterPageProps {
    searchParams?: Promise<{
        ref?: string;
        partner?: string;
        portal?: string;
    }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const params = searchParams ? await searchParams : undefined;
    const referralCode = params?.ref?.trim().toUpperCase() ?? null;
    const partnerCode = params?.partner?.trim().toUpperCase() ?? null;
    const detectedPortalSite = resolvePortalSite((await headers()).get("host"));
    const previewPortal = params?.portal?.trim().toLowerCase();
    const portalSite: PortalSiteKind = detectedPortalSite === "local" && previewPortal && ["main", "partner", "admin"].includes(previewPortal)
        ? previewPortal as PortalSiteKind
        : detectedPortalSite;
    const portalHint: BackendAccountPortal | null = portalSite === "partner"
        ? "partner"
        : portalSite === "admin"
            ? "staff"
            : portalSite === "main"
                ? "customer"
                : null;

    const portalCandidates: BackendAccountPortal[] = portalHint
        ? [portalHint]
        : ["customer", "partner", "staff"];

    for (const portal of portalCandidates) {
        const token = await getSessionToken(portal);
        if (!token) {
            continue;
        }

        try {
            await fetchBackendJson<BackendAccount>("/account/me", { token });
            redirect(getPortalLoginRedirectHref(portal));
        } catch (error) {
            rethrowNavigationSignal(error);
            // Ignore stale session cookies here and continue to auth screen.
        }
    }

    return (
        <AuthPageShell
            mode="register"
            portalSite={portalSite}
            referralCode={referralCode}
            partnerCode={partnerCode}
        />
    );
}
