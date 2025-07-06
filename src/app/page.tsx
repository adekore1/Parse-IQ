// src/app/page.tsx
'use client'
import FileExplorer from '@/components/FileExplorer';

export default function Home() {
  return (
    <div className="shadow-2xl min-h-full overflow-auto">
      <FileExplorer />
    </div>
  );
}
