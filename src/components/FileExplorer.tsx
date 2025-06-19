// src/components/FileExplorer.tsx
'use client'
import { useRef, useEffect, useState } from 'react';
import type { FileNode } from '@/lib/parser';
import { useRepoTree } from '@/hooks/useRepoTree'
import SummaryCard from './SummaryCard';
import ChatBox from './ChatBox'
import ChatModal from './ChatModal';
import { Message } from './ChatModal';

export default function FileExplorer(){
    const [repoUrl, setRepoUrl] = useState('')
    const { tree, loading, error, loadFromFiles, loadFromURL,} = useRepoTree({ server: !!repoUrl, repoUrl })
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [selected, setSelected] = useState<FileNode | null>(null);
    // It can either hold a single FileNode (the file the user last clicked) or null (no selection).
    // We start at null because no file is chosen when the component first appears.
    // To track which file’s contents to show in the right-hand pane.

    const fileInputRef = useRef<HTMLInputElement>(null)

    const renderTree = (nodes: FileNode[]) => (
        <ul className="pl-4 space-y-1">
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
      <div className="flex h-screen overflow-hidden">
        <aside className="w-1/3 border-r p-4 pb-25 flex flex-col overflow-y-auto max-h-[calc(100vh-64px)]">
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
        <main className="flex-1 min-h-0 flex flex-col space-y-2 overflow-auto">
          {selected ? (
            <>
               {/* Header */}
                <h2 className="text-xl font-semibold px-4">{selected.name}</h2>

                {/* Scrollable Summary area */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  <div className="h-full">
                    <SummaryCard path={selected.path} content={selected.content} />
                  </div>
                </div>
            </>
          ) : (
            <p className="text-gray-500 p-4">Select a file to view its summary</p>
          )}
        </main>
          {/* Fixed Chat at bottom */}
          <button
            className="fixed bottom-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-50"
            onClick={() => setShowChat(true)}
          >
            💬 Open Chat
          </button>
          {showChat && selected &&(
            <ChatModal
              path={selected.path || ''}
              content={selected?.content}
              onClose={() => setShowChat(false)}
              visible={showChat}
              messages = {chatMessages}
              setMessages = {setChatMessages}
            />
          )}
      </div>
    );
}

