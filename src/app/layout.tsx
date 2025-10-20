// File: src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // 1. Import the Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI First-Aid Assistant",
  description: "Get immediate first-aid guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col h-screen`}>
        <ThemeRegistry options={{ key: 'mui' }}>
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <Footer /> {/* 2. Add the Footer here */}
        </ThemeRegistry>
      </body>
    </html>
  );
}