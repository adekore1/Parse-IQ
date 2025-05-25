'use client'

import { useState, useEffect } from 'react'

export default function SummaryCard({ path }: { path: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
      .then(async res => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error || res.statusText)
        }
        return res.json()
      })
      .then(data => {
        setSummary(data.summary)
      })
      .catch(err => {
        console.error('Summary fetch failed:', err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [path])

  if (loading)  return <p>Loading summary…</p>
  if (error)    return <p className="text-red-500">Error: {error}</p>
  if (!summary) return null

  return (
    <div className="my-4 p-4 border rounded bg-gray-50">
      <h4 className="font-semibold">📄 Summary</h4>
      <p className="mt-2 whitespace-pre-wrap">{summary}</p>
    </div>
  )
}
