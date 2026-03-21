export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export function isSupabaseConfigured() {
    return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseConfig() {
    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error("Supabase environment variables are missing.");
    }

    return {
        url: supabaseUrl,
        publishableKey: supabasePublishableKey,
    };
}
