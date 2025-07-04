// \src\app\docs\page.tsx
import ReadmeCard from '@/components/ReadmeCard'

export default function DocsPage() {
  return (
    <main className="p-8 overflow-auto">
      <h1 className="text-3xl font-bold mb-6">📄 Auto-Generated README</h1>
      <ReadmeCard />
    </main>
  )
}