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
      <body className="h-full flex flex-col">
        <header className="shrink-0 bg-gray-800 text-white p-4 flex space-x-4">
          <Link href="/" className="hover:underline">Explorer</Link>
          <Link href="/docs" className="hover:underline">Docs</Link>
          <Link href="/chat" className="hover:underline">Chat</Link>
        </header>
        <div className="h-full flex-1 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
