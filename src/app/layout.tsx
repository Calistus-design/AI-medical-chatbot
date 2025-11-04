// File: src/app/layout.tsx

import type { Metadata } from "next";
// 1. Import 'Roboto' instead of 'Inter'
import { Roboto } from "next/font/google";
import "./globals.css";

import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

// 2. Configure Roboto with the specific weights we will use for our design.
//    This ensures only the necessary font files are loaded.
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap', // Improves font loading performance
});

export const metadata: Metadata = {
  title: "AI First-Aid Assistant",
  description: "Get immediate first-aid guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 3. Apply the roboto.className instead of inter.className */}
      <body className={`${roboto.className} flex flex-col min-h-screen bg-gradient-to-br from-primary-blue/35 to-background`}>
        <AuthProvider>
          <ThemeRegistry options={{ key: 'mui' }}>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}