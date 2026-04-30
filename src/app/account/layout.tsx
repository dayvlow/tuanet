import type { Metadata } from "next";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
    icons: {
        icon: [
            { url: "/favicon.ico" },
        ],
        apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "640x640" }],
    },
};

export default async function AccountLayout({ children }: { children: ReactNode }) {
    return children;
}
