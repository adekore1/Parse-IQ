// src/app/page.tsx
'use client'
import FileExplorer from '@/components/FileExplorer';

export default function Home() {
  return (
    <div className="h-full">
      <h1>FlowDoc</h1>
      <FileExplorer />
    </div>
  );
}
