import { LogoutClient } from "@/components/account/LogoutClient";
import { normalizePortalParam } from "@/lib/session-portal";

interface LogoutPageProps {
    searchParams?: Promise<{
        portal?: string;
        next?: string;
    }>;
}

export default async function LogoutPage({ searchParams }: LogoutPageProps) {
    const params = searchParams ? await searchParams : undefined;
    const nextHref = params?.next && params.next.startsWith("/") && !params.next.startsWith("//")
        ? params.next
        : null;
    return <LogoutClient portal={normalizePortalParam(params?.portal)} nextHref={nextHref} />;
}
