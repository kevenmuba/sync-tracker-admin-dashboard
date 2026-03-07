import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import "@/lib/supabase"; // Import to trigger the console.log string

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BRESS Dashboard",
  description: "Modern Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-bg-main font-sans selection:bg-brand-primary/10">
          {children}
        </div>
      </body>
    </html>
  );
}
