import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSafeNextPath } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const next = getSafeNextPath(requestUrl.searchParams.get("next"));

    if (!isSupabaseConfigured()) {
        return NextResponse.redirect(new URL("/login", requestUrl.origin));
    }

    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

    const supabase = await createClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return NextResponse.redirect(new URL("/login?auth=error", requestUrl.origin));
        }
    }

    if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash: tokenHash,
        });

        if (error) {
            return NextResponse.redirect(new URL("/login?auth=error", requestUrl.origin));
        }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
