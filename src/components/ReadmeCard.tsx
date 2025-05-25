'use client'

import { useState, useEffect } from 'react'

export default function ReadmeCard() {
  const [md, setMd] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/readme')
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || res.statusText)
        }
        return res.json()
      })
      .then(data => {
        setMd(data.markdown)
      })
      .catch(err => {
        console.error('README fetch failed:', err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading)  return <p>Loading README...</p>
  if (error)    return <p className="text-red-500">Error: {error}</p>
  if (!md) return null

  return (
    <div className="my-4 p-4 border rounded bg-gray-50">
      <h4 className="font-semibold">📄 README</h4>
      <p className="mt-2 whitespace-pre-wrap">{md}</p>
    </div>
  )
}
