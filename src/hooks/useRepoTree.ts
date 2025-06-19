//src\hooks\useRepoTree.ts

import { useState, useEffect, useCallback } from 'react'
import type { FileNode } from '@/lib/parser'
import { parseDirectory } from '@/lib/parser'  // for server fetch
import { parse } from 'path'


interface UseRepoTreeOpts {
  /** if true, on mount fetch from /api/tree; otherwise start empty */
  server?: boolean
  repoUrl?: string
}

const IGNORE = new Set([
  '.git',
  'node_modules',
  '.next',
  '.vercel',
]);

const IGNORED_FILES = new Set([
  'package-lock.json'
]);

// define allowed filetypes
const ALLOWED = new Set([
  // TypeScript / JavaScript
  '.ts', '.tsx', '.js', '.jsx',

  // Python
  '.py',

  // Java
  '.java',

  // C-family
  '.c', '.cpp', '.h', '.hpp', '.cs',

  // Go
  '.go',

  // Rust
  '.rs',

  // Ruby
  '.rb',

  // PHP
  '.php',

  // Kotlin
  '.kt', '.kts',

  // Swift
  '.swift',

  // Dart / Flutter
  '.dart',

  // Shell scripts
  '.sh', '.bash', '.zsh',

  // Documentation / Markup
  '.md', '.rst', '.txt', '.adoc',

  // Config / Metadata
  '.json', '.yaml', '.yml', '.toml', '.ini', '.env',

  // Web / UI
  '.html', '.htm', '.css', '.scss', '.sass', '.less', '.xml',
  '.vue', '.svelte',

  // Office / Reference files (optional)
  '.pdf', '.docx',
]);

export function useRepoTree({server = false, repoUrl}: UseRepoTreeOpts={}){
    const [tree,setTree] = useState<FileNode[]>([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null)

    const loadFromServer = useCallback( async () => {
        setLoading(true)
        setError(null)

        try{
            const res = await fetch('/api/tree')
            if (!res.ok) throw new Error(res.statusText)
                const data: FileNode[] = await res.json()
            setTree(data)
        } catch (e:any){
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadFromURL = useCallback( async(url: string )=>{
        setError(null)
        setLoading(true)

        try{
            const res = await fetch('/api/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || res.statusText)
            }
            const data: FileNode[] = await res.json()
            setTree(data)
        }catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    },[])

    const loadFromFiles = useCallback( async (files: FileList) => {
        setError(null)
        setLoading(true)

        try{
            const fileArray = Array.from(files)
            const nodes: FileNode[] = []

            for (const file of fileArray){
                const relPath = (file as any).webkitRelativePath || file.name
                const levels = relPath.split('/')
                const filename = levels[levels.length - 1];
                
                if (IGNORED_FILES.has(filename)) {
                continue;
                }

                if (levels.some((segment: any) => IGNORE.has(segment))) {
                    continue
                }

                const { ext } = parse(relPath)
                if (!ALLOWED.has(ext)) {
                    continue
                }

                let currentLevel = nodes

                for(let i =0; i<levels.length; i++) {

                    const name = levels[i]

                    let node = currentLevel.find(n => n.name === name)
                    if(!node) {
                        node = {name,
                                path: levels.slice(0, i+1).join('/'),
                                isDirectory: i<levels.length - 1,
                                children: i < levels.length - 1? [] : undefined,
                        };
                        currentLevel.push(node);
                    }
                    if (i === levels.length - 1 && !node.isDirectory) {
                        if( ext === '.pdf' || ext ==='.docx'){
                            const formData = new FormData()
                            formData.append('file', file)

                            const res = await fetch('/api/pdfDocxParse', {
                                method: 'POST',
                                body: formData,
                            })

                            const result = await res.json().catch(() => null)
                            if (!res.ok || !result?.text) {
                                throw new Error(result?.error || "Failed to parse PDF/DOCX content");
                            }
                            node.content = result.text;
                        } else {
                            node.content = await new Promise<string>((res, rej) => {
                            const reader = new FileReader();
                            reader.onload = () => res(reader.result as string);
                            reader.onerror = () => rej(reader.error);
                            reader.readAsText(file);
                            });
                        }  
                    }
                    if (node.children) {
                    currentLevel = node.children;
                    }
                }
            }
            setTree(nodes)
        } catch (e:any){
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
    if (server) {
      if (repoUrl) loadFromURL(repoUrl)
      else         loadFromServer()
    }
  }, [server, repoUrl, loadFromURL, loadFromServer])

    return {
        tree,
        loading,
        error,
        loadFromFiles,
        loadFromURL,
        loadFromServer,
        setTree,
    }
}

