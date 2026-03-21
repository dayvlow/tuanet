import { redirect } from "next/navigation";
import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth-redirect";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; auth?: string }>;
}) {
    const params = await searchParams;
    const nextPath = getSafeNextPath(params.next);

    if (isSupabaseConfigured()) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            redirect(nextPath);
        }
    }

    return <AuthFormShell mode="login" nextPath={nextPath} authError={params.auth === "error"} />;
}
