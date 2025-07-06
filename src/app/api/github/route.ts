import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { join } from 'path';
import { tmpdir } from 'os';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { parseDirectory, FileNode } from '@/lib/parser';

function parseGitHubUrl(repoUrl: string) {
  const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/|$)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
  };
}

export async function POST(req: NextRequest) {
  const { url } = (await req.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ error: 'Missing "url" in request' }, { status: 400 });
  }

  const repoInfo = parseGitHubUrl(url);
  if (!repoInfo) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  const { owner, repo } = repoInfo;
  const cloneDir = join(tmpdir(), `flowdoc-${uuid()}`);
  const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;

  try {
    const res = await fetch(zipUrl);
    if (!res.ok) throw new Error(`GitHub ZIP fetch failed: ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());

    // extract buffer
    const zip = new AdmZip(buffer);
    zip.extractAllTo(cloneDir, true);

    // GitHub adds a root folder: repo-main/
    const rootDir = join(cloneDir, `${repo}-main`);
    const tree: FileNode[] = await parseDirectory(rootDir, rootDir);

    return NextResponse.json(tree);
  } catch (err: any) {
    console.error('Failed to fetch or parse repo:', err);
    return NextResponse.json(
      { error: `Failed to fetch or parse repo: ${err.message}` },
      { status: 500 }
    );
  } finally {
    try {
      await fs.remove(cloneDir);
    } catch {}
  }
}
