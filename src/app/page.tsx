// src/app/page.tsx
'use client'
import FileExplorer from '@/components/FileExplorer';

export default function Home() {
  return (
    <div className="min-h-full overflow-auto">
      <h1>FlowDoc</h1>
      <FileExplorer />
    </div>
  );
}
