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
  '.vercel'
]);

// define allowed filetypes
const ALLOWED = new Set([
  '.tsx','.ts',
  '.jsx', '.js',
  '.json', '.md',
  '.d.ts', '.css',
  '.html'
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
                        node.content = await new Promise<string>((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(reader.result as string);
                        reader.onerror = () => rej(reader.error);
                        reader.readAsText(file);
                    });
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