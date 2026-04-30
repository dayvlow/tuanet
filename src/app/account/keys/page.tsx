import { redirect } from "next/navigation";

export default async function KeysPage() {
    redirect("/account/devices");
}
