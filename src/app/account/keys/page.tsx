import { KeysClientPage } from "@/components/account/KeysClientPage";
import { getAccountData } from "@/lib/supabase/account";

export default async function KeysPage({
    searchParams,
}: {
    searchParams: Promise<{ create?: string; state?: string }>;
}) {
    const params = await searchParams;
    const data = await getAccountData();
    const forcedState = (params.state ?? "success") as "success" | "loading" | "empty" | "error";
    const state =
        forcedState === "success" && data.errors.keys
            ? "error"
            : forcedState === "success" && data.keys.length === 0
              ? "empty"
              : forcedState;

    return (
        <KeysClientPage
            initialKeys={data.keys}
            initialState={state}
            initialCreateOpen={params.create === "1"}
        />
    );
}
