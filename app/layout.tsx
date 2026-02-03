import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { WalletProvider } from "@/contexts/WalletContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ReferralTracker } from "@/components/ReferralTracker";
import { Suspense } from "react";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hero Global – Metaverse & NFTs",
  description: "Khám phá metaverse và các sản phẩm NFT tại Hero Global",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light h-full">
      <body className={`${plusJakarta.variable} antialiased h-full w-full flex justify-center bg-slate-100`}>
        <div className="w-full max-w-[480px] h-full bg-[var(--color-background)] shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)] overflow-hidden relative font-sans">
          <ConfigProvider>
            <WalletProvider>
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>
              {children}
            </WalletProvider>
          </ConfigProvider>
        </div>
      </body>
    </html>
  );
}
