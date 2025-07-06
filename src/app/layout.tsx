// src/app/layout.tsx
import './globals.css'
import Link from 'next/link'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parse IQ",
  description: "AI-powered code explorer & docs generator",
icons: {
    icon: "/favicon.ico",         // or "/your-icon.png"
    shortcut: "/favicon.ico",     // for compatibility
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <header className="shrink-0 bg-[#242428] text-white p-4 flex space-x-4">
          <Link href="/" className="hover:underline text-center">Parse IQ</Link>
        </header>
        <div className="h-full flex-1 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
