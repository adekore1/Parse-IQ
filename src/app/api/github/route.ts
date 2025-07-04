// source/api/github/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { simpleGit } from 'simple-git'
import { v4 as uuid } from 'uuid'
import { join } from 'path'
import { tmpdir } from 'os'
import fs from 'fs-extra'
import { parseDirectory, FileNode } from '@/lib/parser'

// rceive post request (contains header, type and body{url})
export async function POST(req: NextRequest){
  // 1) extract url
    const { url } = (await req.json()) as { url?: string }
    // check url validity
  if (!url) {
    return NextResponse.json({ error: 'Missing "url" in request' }, { status: 400 })
  }

  // 2) make temp folder/directory to store the parsed url later
  const cloneDir = join(tmpdir(), `flowdoc-${uuid()}`)

  try {
    // 3) Clone the repo shallowly into the temp folder
    await simpleGit().clone(url, cloneDir, { '--depth': '1' })

    // 4) Parse that directory into your FileNode[] tree
    const tree: FileNode[] = await parseDirectory(cloneDir, cloneDir)

    // 5) Return the tree as JSON
    return NextResponse.json(tree)
  } catch (err: unknown) {
    console.error('Error cloning or parsing GitHub repo:', err)
    return NextResponse.json(
      { error: `Failed to fetch or parse repo: ${err}` },
      { status: 500 }
    )
  } finally {
    // 6) Clean up the temp folder
    try {
      await fs.remove(cloneDir)
    } catch {}
  }
}