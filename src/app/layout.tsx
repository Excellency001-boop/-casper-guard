import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasperGuard — AI-Powered DeFi Insurance on Casper Network",
  description: "4 autonomous AI agents protect your DeFi positions using Casper AI Toolkit — MCP Servers, x402 Micropayments, CSPR.click Agent Skill, and Odra Smart Contracts. Live on Casper Testnet.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "CasperGuard — AI-Powered DeFi Insurance",
    description: "Autonomous AI agents protecting DeFi on Casper Network with real-time risk monitoring, instant claims, and x402 micropayments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
