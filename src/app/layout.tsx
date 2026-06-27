import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasperGuard — AI-Powered DeFi Insurance",
  description: "Autonomous AI agents protecting your DeFi positions on Casper Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex bg-bg-primary text-text-primary antialiased">
        <Sidebar />
        <main className="flex-1 pt-16 lg:pt-0 lg:ml-64 px-4 pb-4 lg:p-6 overflow-auto min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
