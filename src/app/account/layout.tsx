import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    if (isSupabaseConfigured()) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            redirect("/login");
        }
    }

    return children;
}
