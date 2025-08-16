// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Gugi, Orbitron, Roboto_Mono } from "next/font/google";

const gugi = Gugi({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gugi",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ehsan • Portfolio",
  description: "ChatGPT-style portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${gugi.variable} ${orbitron.variable} ${robotoMono.variable}`}
    >
      {/* Default to your body font via Tailwind (set in tailwind.config.ts) */}
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
