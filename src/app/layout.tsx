import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Noise } from "@/components/ui/Noise";

export const metadata: Metadata = {
  title: "Туанет — контроль подключения и подписки",
  description: "Туанет помогает быстро подключаться, управлять устройствами и подпиской без лишних шагов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark scroll-smooth">
      <body className="antialiased bg-black text-white selection:bg-brand selection:text-black font-sans">
        <Noise />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
