"use client";
import { useRef, useState } from "react";
import type { FileNode } from "@/lib/parser";
import { useRepoTree } from "@/hooks/useRepoTree";
import SummaryCard from "./SummaryCard";
import ChatModal from "./ChatModal";
import { Message } from "./ChatModal";
import ReadmeCard from "./ReadmeCard";

export default function FileExplorer() {
  const [repoUrl, setRepoUrl] = useState("");
  const { tree, loading, error, loadFromFiles, loadFromURL } = useRepoTree({
    server: !!repoUrl,
    repoUrl,
  });
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<FileNode | null>(null);
  const [showReadme, setShowReadme] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderTree = (nodes: FileNode[]) => (
    <ul className="pl-4 pb-4 space-y-1">
      {nodes.map((n) => (
        <li key={n.path}>
          <button
            className="text-left text-gray-400 text-sm hover:text-white hover:cursor-pointer transition-colors"
            onClick={() => !n.isDirectory && setSelected(n)}
          >
            {n.isDirectory ? "📁" : "📄"} {n.name}
          </button>
          {n.children && renderTree(n.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex h-screen overflow-auto bg-[#242428] text-gray-200">
      <aside className="w-1/3 min-w-[175px] max-w-[30vw] border-1 rounded-tr-2xl border-[#6f6e6e] p-3 flex flex-col overflow-y-auto bg-[#242428] shadow-2xl">
        {/* <div className="mb-6 ">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Paste GitHub URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 text-xs bg-[#373737] text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
            />
            <button
              className="bg-indigo-600 text-gray-2 00 px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
              onClick={() => loadFromURL(repoUrl)}
            >
              Fetch
            </button>
          </div>
        </div> */}

        <div
          className="mb-4 p-6 text-gray-400 border-gray-400 text-center rounded-lg bg-[#373737] hover:bg-[#4a4a4a] cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            loadFromFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-sm">Drag & drop a CODEBASE here
          </p>
          <p className="text-indigo-500 underline text-sm">
            or click to select one
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            {...{ webkitdirectory: "" }}
            onChange={(e) => e.target.files && loadFromFiles(e.target.files)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading files…</p>
        ) : error ? (
          <p className="text-red-500 text-sm">Error: {error}</p>
        ) : tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <p className="text-gray-400 text-sm">No files loaded</p>
        )}
      </aside>

      <div className="flex-1 max-h-[88.5vh] overflow-y-hidden overflow-x-auto">
        <div className="flex w-max min-w-full overflow-x-auto ">
          <div className="min-w-[400px] max-w-[70vw] p-4 bg-[#242428] shadow-sm">
            {selected ? (
              <>
                <h2 className="text-sm font-semibold text-gray-400 mb-4 border-b pb-2">
                  {selected.name}
                </h2>
                <div className="flex-1 min-h-0 overflow-y-auto ">
                  <SummaryCard
                    path={selected.path}
                    content={selected.content}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-400 p-4">
                Select a file to view its summary
              </p>
            )}
          </div>

          {showReadme && tree && tree.length > 0 && (
            <aside className="min-w-[400px] max-w-[70vw] p-4 bg-[#1f1f24] shadow-sm">
              <ReadmeCard tree={tree} />
            </aside>
          )}
        </div>
      </div>

      <button
        className="fixed bottom-20 right-6 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 z-50"
        onClick={() => setShowReadme(true)}
      >
        📄 Generate README
      </button>

      <button
        className="fixed bottom-6 right-6 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 z-50"
        onClick={() => setShowChat(true)}
      >
        💬 Open Chat
      </button>

      {showChat && selected && (
        <ChatModal
          path={selected.path || ""}
          content={selected?.content}
          onClose={() => setShowChat(false)}
          visible={showChat}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      )}
    </div>
  );
}
