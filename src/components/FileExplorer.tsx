'use client'
import { useEffect, useState } from 'react';
import type { FileNode } from '@/lib/parser';

export default function FileExplorer(){
    const [tree, setTree] = useState<FileNode[]>([]);
    // Creates a piece of React “state” called tree
    // tree will hold an array of FileNode objects—our in-memory representation of your repo
    // By passing [] as the initial value, we start with an empty list.

    // Before we fetch anything, tree must exist (even if it’s empty), so the component can safely try to render.


    const [selected, setSelected] = useState<FileNode | null>(null);
    // It can either hold a single FileNode (the file the user last clicked) or null (no selection).
    // We start at null because no file is chosen when the component first appears.
    // To track which file’s contents to show in the right-hand pane.

    useEffect(() => {
        fetch('/api/tree')
        .then(result => result.json())
        .then(setTree)
    }, []);

     // TODO: render UI
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
            <aside className="w-1/3 border-r p-4 overflow-auto">
            {tree.length ? renderTree(tree) : 'Loading…'}
            </aside>
            <main className="flex-1 p-4 overflow-auto">
            {selected 
                ? <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
                    {selected.content}
                </pre>
                : 'Select a file to view its contents'}
            </main>
        </div>
        );
}
