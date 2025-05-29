import { NextRequest, NextResponse } from 'next/server'
import { simpleGit } from 'simple-git'
import { v4 as uuid } from 'uuid'
import { join } from 'path'
import { tmpdir } from 'os'
import fs from 'fs-extra'
import { parseDirectory, FileNode } from '@/lib/parser'

export async function POST(req: NextRequest){
    const { url } = (await req.json()) as { url?: string }
  if (!url) {
    return NextResponse.json({ error: 'Missing "url" in request' }, { status: 400 })
  }

  const cloneDir = join(tmpdir(), `flowdoc-${uuid()}`)

  try {
    // 3) Clone the repo shallowly
    await simpleGit().clone(url, cloneDir, { '--depth': '1' })

    // 4) Parse that directory into your FileNode[] tree
    const tree: FileNode[] = await parseDirectory(cloneDir, cloneDir)

    // 5) Return the tree as JSON
    return NextResponse.json(tree)
  } catch (err: any) {
    console.error('Error cloning or parsing GitHub repo:', err)
    return NextResponse.json(
      { error: `Failed to fetch or parse repo: ${err.message}` },
      { status: 500 }
    )
  } finally {
    // 6) Clean up the temp folder
    try {
      await fs.remove(cloneDir)
    } catch {}
  }
}