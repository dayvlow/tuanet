import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const createClient = () => {
    const { url, publishableKey } = getSupabaseConfig();
    return createBrowserClient(url, publishableKey);
};
