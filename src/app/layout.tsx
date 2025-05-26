// src/app/layout.tsx
import './globals.css'
import Link from 'next/link'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlowDoc",
  description: "AI-powered code explorer & docs generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col h-full">
        <header className="bg-gray-800 text-white p-4 flex space-x-4">
          <Link href="/" className="hover:underline">Explorer</Link>
          <Link href="/docs" className="hover:underline">Docs</Link>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
