"use client";

import { cn } from "@/lib/utils";

interface BrandedQrCardProps {
    qrCodeUrl: string | null;
    title?: string;
    subtitle?: string;
    accentLabel?: string;
    compact?: boolean;
    className?: string;
}

export function BrandedQrCard({
    qrCodeUrl,
    title = "TUANET ACCESS",
    subtitle = "SCAN TO CONNECT",
    accentLabel = "VLESS",
    compact = false,
    className,
}: BrandedQrCardProps) {
    return (
        <div
            className={cn(
                "rounded-[34px] border-2 border-black/10 bg-[#f4f5f7] shadow-[0_18px_36px_rgba(0,0,0,0.08)]",
                compact ? "p-3" : "p-4",
                className
            )}
        >
            <div
                className={cn(
                    "rounded-[32px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]",
                    compact ? "px-4 pb-4 pt-5" : "px-4 pb-4 pt-6"
                )}
            >
                <div className={cn("flex justify-center", compact ? "mb-4" : "mb-5")}>
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-full border-2 border-black/10 bg-black",
                            compact ? "h-14 w-14" : "h-16 w-16"
                        )}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/tuanet-logo.jpeg"
                            alt="TUANET icon"
                            className={cn(compact ? "h-10 w-10" : "h-11 w-11")}
                        />
                    </div>
                </div>
                {qrCodeUrl ? (
                    <div
                        className={cn(
                            "relative mx-auto flex aspect-square w-full items-center justify-center rounded-[28px] border-2 border-black/10 bg-white",
                            compact ? "max-w-[220px] p-4" : "max-w-[248px] p-5"
                        )}
                    >
                        <div
                            className={cn(
                                "relative z-10 flex aspect-square w-full items-center justify-center bg-white",
                                compact ? "max-w-[172px]" : "max-w-[196px]"
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={qrCodeUrl}
                                alt="QR code"
                                className="block h-auto w-full"
                            />
                        </div>

                        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                            <div
                                className={cn(
                                    "flex items-center justify-center rounded-full border-white bg-black shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
                                    compact ? "h-[58px] w-[58px] border-4" : "h-[66px] w-[66px] border-[5px]"
                                )}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/tuanet-logo.jpeg"
                                    alt="TUANET icon"
                                    className={cn(compact ? "h-[40px] w-[40px]" : "h-[46px] w-[46px]")}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-[28px] border-2 border-dashed border-black/10 bg-white text-center text-sm font-medium text-black/45",
                            compact ? "h-[228px]" : "h-[264px]"
                        )}
                    >
                        QR появится, когда будет готова ссылка подключения
                    </div>
                )}

                <div className={cn("text-center", compact ? "mt-3" : "mt-4")}>
                    <div
                        className={cn(
                            "truncate font-black uppercase tracking-tight text-black",
                            compact ? "text-[22px]" : "text-[24px]"
                        )}
                    >
                        {title}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                        {subtitle} · {accentLabel}
                    </div>
                </div>
            </div>
        </div>
    );
}
