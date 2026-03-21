import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
    const { url, publishableKey } = getSupabaseConfig();

    return createServerClient(url, publishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Ignored in Server Components. Session refresh is handled by proxy.ts.
                }
            },
        },
    });
};
