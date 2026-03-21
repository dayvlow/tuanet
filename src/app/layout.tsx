import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Noise } from "@/components/ui/Noise";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Туанет — простой VPN для работы и повседневного использования",
  description: "Подключайте устройства, управляйте доступом и держите всё под рукой в одном кабинете.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark scroll-smooth" data-theme="dark" suppressHydrationWarning>
      <body
        className="antialiased bg-black text-white selection:bg-brand selection:text-black font-sans"
        suppressHydrationWarning
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var theme=localStorage.getItem("tuaanet-theme");var resolved=theme==="light"||theme==="dark"?theme:"dark";document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark";}`,
          }}
        />
        <ThemeProvider>
          <Noise />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
