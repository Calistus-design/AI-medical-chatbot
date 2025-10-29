// File: src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <-- This line loads all your Tailwind CSS. It MUST be here.

// These are the components that provide global functionality to your app.
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI First-Aid Assistant",
  description: "Get immediate first-aid guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* The `min-h-screen` and `flex` classes are crucial for your layout. */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/*
          1. AuthProvider must be near the top so the whole app can access the session.
        */}
        <AuthProvider>
          {/*
            2. ThemeRegistry is ESSENTIAL. It injects all the Material-UI styles.
               If this is missing or in the wrong place, the UI will break exactly
               as you've seen. It must wrap the Navbar and the page content.
          */}
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