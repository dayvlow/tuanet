import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const next = requestUrl.searchParams.get("next") ?? "/account";

    if (!isSupabaseConfigured()) {
        return NextResponse.redirect(new URL("/login", requestUrl.origin));
    }

    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

    const supabase = await createClient();

    if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    if (tokenHash && type) {
        await supabase.auth.verifyOtp({
            type,
            token_hash: tokenHash,
        });
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
