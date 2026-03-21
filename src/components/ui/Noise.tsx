export function Noise() {
    return (
        <>
            <div className="site-background pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="site-background__gradient absolute inset-0" />
                <div className="site-background__orb site-background__orb--one" />
                <div className="site-background__orb site-background__orb--two" />
                <div className="site-background__orb site-background__orb--three" />

                <svg
                    className="site-background__lines absolute inset-0 h-full w-full"
                    viewBox="0 0 1440 1200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path d="M-80 160C180 60 402 72 620 168C854 271 1098 302 1520 190" />
                    <path d="M-40 680C190 570 374 560 580 612C850 680 1120 760 1500 700" />
                    <path d="M220 1140C386 920 556 818 792 812C1044 806 1244 902 1498 1110" />
                    <circle cx="220" cy="240" r="84" />
                    <circle cx="1170" cy="318" r="136" />
                    <circle cx="1032" cy="926" r="110" />
                    <circle cx="366" cy="948" r="52" />
                </svg>

                <div className="site-background__grid absolute inset-0" />
            </div>

            <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03] mix-blend-overlay">
                <svg
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <filter id="noise">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.65"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>
        </>
    );
}
