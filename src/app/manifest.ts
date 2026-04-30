import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ТУАНЕТ",
        short_name: "ТУАНЕТ",
        description: "Подключайте устройства, управляйте доступом и держите всё под рукой в одном кабинете.",
        start_url: "/account?portal=customer",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
            {
                src: "/apple-touch-icon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/apple-touch-icon.png",
                sizes: "640x640",
                type: "image/png",
            },
        ],
    };
}
