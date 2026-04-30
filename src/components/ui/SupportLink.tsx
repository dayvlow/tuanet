"use client";

import { ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";

interface SupportLinkProps {
    href: string;
    channel: "email" | "telegram";
    children: ReactNode;
    className?: string;
    target?: string;
    rel?: string;
}

function reportSupportContact(payload: { channel: "email" | "telegram"; target: string; path: string }) {
    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/support/contact", blob);
        return;
    }

    void fetch("/api/support/contact", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body,
        keepalive: true,
    }).catch(() => null);
}

export function SupportLink({
    href,
    channel,
    children,
    className,
    target,
    rel,
}: SupportLinkProps) {
    const pathname = usePathname();

    const handleClick = useCallback(() => {
        reportSupportContact({
            channel,
            target: href,
            path: pathname || "/",
        });
    }, [channel, href, pathname]);

    return (
        <a
            href={href}
            target={target}
            rel={rel}
            className={className}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
