// src/components/FileExplorer.tsx
'use client'
import { useRef, useEffect, useState } from 'react';
import type { FileNode } from '@/lib/parser';
import { useRepoTree } from '@/hooks/useRepoTree'
import SummaryCard from './SummaryCard';
import ChatBox from './ChatBox'



export default function FileExplorer(){
    const [repoUrl, setRepoUrl] = useState('')
    const { tree, loading, error, loadFromFiles, loadFromURL,} = useRepoTree({ server: !!repoUrl, repoUrl })
     
    const [selected, setSelected] = useState<FileNode | null>(null);
    // It can either hold a single FileNode (the file the user last clicked) or null (no selection).
    // We start at null because no file is chosen when the component first appears.
    // To track which file’s contents to show in the right-hand pane.

    const fileInputRef = useRef<HTMLInputElement>(null)

    const renderTree = (nodes: FileNode[]) => (
        <ul className="pl-4">
            {nodes.map(n => (
            <li key={n.path}>
                <button
                className="text-left hover:underline"
                onClick={() => !n.isDirectory && setSelected(n)}
                >
                {n.isDirectory ? '📁' : '📄'} {n.name}
                </button>
                {n.children && renderTree(n.children)}
            </li>
            ))}
        </ul>
        );
    

    return (
      <div className="flex h-full">
        <aside className="w-1/3 border-r p-4 flex flex-col">
          {/* 1) Drop-zone + hidden input */}
          <div
            className="mb-4 p-6 border-2 border-dashed text-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              loadFromFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <p>Drag & drop a folder here</p>
            <p className="text-blue-600 underline">or click to select one</p>
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              {...{ webkitdirectory: "" }}
              onChange={(e) => e.target.files && loadFromFiles(e.target.files)}
            />
          </div>

          {/* 2) Loading / error / tree */}
          {loading ? (
            <p>Loading files…</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : tree.length > 0 ? (
            renderTree(tree)
          ) : (
            <p className="text-gray-500">No files loaded</p>
          )}
        </aside>

        {/* 3) Main pane: summary + chat */}
        <main className="flex-1 p-4 overflow-auto flex flex-col">
          {selected ? (
            <>
              <h2 className="text-xl font-semibold mb-2">{selected.name}</h2>
              <SummaryCard path={selected.path} content={selected.content} />
              <div className="mt-4 flex-1">
                <ChatBox path={selected.path} content={selected.content} />
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a file to view its summary</p>
          )}
        </main>
      </div>
    );
}

