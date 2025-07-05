//src\hooks\useRepoTree.ts
import { useState, useEffect, useCallback, } from "react";
import type { FileNode } from "@/lib/parser";
import { parse } from "path";

interface UseRepoTreeOpts {
  /** if true, on mount fetch from /api/tree; otherwise start empty */
  server?: boolean;
  repoUrl?: string;
  setTree?: (tree: FileNode[]) => void;
}

const IGNORE = new Set([".git", "node_modules", ".next", ".vercel"]);

const IGNORED_FILES = new Set(["package-lock.json"]);

// define allowed filetypes
const ALLOWED = new Set([
  // TypeScript / JavaScript
  ".ts",
  ".tsx",
  ".js",
  ".jsx",

  // Python
  ".py",

  // Java
  ".java",

  // C-family
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",

  // Go
  ".go",

  // Rust
  ".rs",

  // Ruby
  ".rb",

  // PHP
  ".php",

  // Kotlin
  ".kt",
  ".kts",

  // Swift
  ".swift",

  // Dart / Flutter
  ".dart",

  // Shell scripts
  ".sh",
  ".bash",
  ".zsh",

  // Documentation / Markup
  ".md",
  ".rst",
  ".txt",
  ".adoc",

  // Config / Metadata
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".env",

  // Web / UI
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".xml",
  ".vue",
  ".svelte",

  // Office / Reference files (optional)
  ".pdf",
  ".docx",
]);

export function useRepoTree({ server = false, repoUrl, setTree: externalSetTree }: UseRepoTreeOpts = {}) {
  // initialize needed react elements
  // const [tree, setTree] = useState<FileNode[]>([]);
  const [internalTree, internalSetTree] = useState<FileNode[]>([]);
  const tree = internalTree;
  const setTree = externalSetTree ?? internalSetTree;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // make api call
      const res = await fetch("/api/tree");
      if (!res.ok) throw new Error(res.statusText);
      // extract data
      const data: FileNode[] = await res.json();
      // make tree
      setTree(data);
    } catch (e: unknown) {
      if(e instanceof Error){
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromURL = useCallback(async (url: string) => {
    // receive url

    // set react elements to needed values
    setError(null);
    setLoading(true);

    try {
      // make api call to parse url
      const res = await fetch("/api/github", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      // check validity  of return
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || res.statusText);
      }
      // extract tree data rom res
      const data: FileNode[] = await res.json();

      // make the tree
      setTree(data);
    } catch (e: unknown) {
      if(e instanceof Error){
      setError(e.message);}
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromFiles = useCallback(async (files: FileList) => {
    // accept file list (folder dropped in)
    setError(null);
    setLoading(true);

    try {
      // convert filelist to array
      const fileArray = Array.from(files);
      // make empty list of fileNodes for parsing and tree building
      const nodes: FileNode[] = [];

      // iterate files
      for (const file of fileArray) {
        // get relative path of each )(eg. "src/components/button.tsx")
        const relPath = (file as any).webkitRelativePath || file.name;
        // split filepath into array of folders (["src", "components", "Button.tsx"]) to be able to grab filename
        const levels = relPath.split("/");
        // get name of each file
        const filename = levels[levels.length - 1];

        // check if allowed
        if (IGNORED_FILES.has(filename)) {
          continue;
        }

        // check if folder is allowed
        if (levels.some((segment: any) => IGNORE.has(segment))) {
          continue;
        }

        // get filetype, (ext)
        const { ext } = parse(relPath);

        if (!ALLOWED.has(ext)) {
          continue;
        }

        // temporary fileNode array for parsing, start at the root
        let currentLevel = nodes;

        // iterate through each level of each file, still kinda confused
        for (let i = 0; i < levels.length; i++) {
          // get name of each level, so the name of each part, like "src" etc
          const name = levels[i];
          
          //check if the current node is already present
          let node = currentLevel.find((n) => n.name === name);
          // remember that duplicate folders/files cant exist, so this makes sure that doesnt happen
          if (!node) {
            node = {
              name,
              path: levels.slice(0, i + 1).join("/"),
            //   check if directory, is it the last member of the level array
              isDirectory: i < levels.length - 1,
            //   check if it has children (is it the last in its level or not)
              children: i < levels.length - 1 ? [] : undefined,
            };
            // add node to array for current level
            currentLevel.push(node);
          }

        //   if its at the last level and not a directory, read content
          if (i === levels.length - 1 && !node.isDirectory) {
            // special read for pdf and docx
            if (ext === ".pdf" || ext === ".docx") {
              const formData = new FormData();
              formData.append("file", file);
  
              const res = await fetch("/api/pdfDocxParse", {
                method: "POST",
                body: formData,
              });

              const result = await res.json().catch(() => null);
              if (!res.ok || !result?.text) {
                throw new Error(
                  result?.error || "Failed to parse PDF/DOCX content"
                );
              }
              node.content = result.text;
            } else {
                // regular file reading
              node.content = await new Promise<string>((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result as string);
                reader.onerror = () => rej(reader.error);
                reader.readAsText(file);
              });
            }
          }
        //   move to the next level
          if (node.children) {
            currentLevel = node.children;
          }
        }
      }
      setTree(nodes);
    } catch (e: unknown) {
      if(e instanceof Error){
      setError(e.message);}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (server) {
      if (repoUrl) loadFromURL(repoUrl);
      else loadFromServer();
    }
  }, [server, loadFromURL, loadFromServer, repoUrl]);

  return {
    tree,
    loading,
    error,
    loadFromFiles,
    loadFromURL,
    loadFromServer,
    setTree,
  };
}
