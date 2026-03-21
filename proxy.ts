import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.next({ request });
    }

    const { supabase, response } = createClient(request);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/account")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
        const url = request.nextUrl.clone();
        url.pathname = "/account";
        url.searchParams.delete("next");
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: ["/account/:path*", "/login", "/register"],
};
