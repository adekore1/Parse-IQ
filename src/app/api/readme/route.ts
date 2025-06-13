// src/app/api/readme/route.ts
import { NextResponse, NextRequest } from 'next/server'
import path from 'path'
import { parseDirectory, FileNode } from '@/lib/parser'
import { generateReadme } from '@/lib/readmeGenerator'

export async function GET(req: NextRequest){
    try{
     // 1. Determine the root you want to scan (e.g. your src folder)
    const srcRoot = path.join(process.cwd(), 'src')

     // 2. Parse that directory into a FileNode[]
    const tree: FileNode[] = await parseDirectory(srcRoot, srcRoot)


     const markdown = await generateReadme(tree)

    return NextResponse.json({ markdown })
  } catch (err: any) {
      console.error('Error in /api/readme GET:', err)
      return NextResponse.json(
        { error: 'Failed to generate README' },
        { status: 500 }
      )
    }
}

export async function POST(req: NextRequest) {
  try {
    const { tree } = (await req.json()) as { tree: FileNode[] }
    if (!Array.isArray(tree)) throw new Error('Invalid tree payload')
    const markdown = await generateReadme(tree)
    return NextResponse.json({ markdown })
  } catch (err: any) {
    console.error('Error in /api/readme POST:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}