'use client'

import React, { createContext, useContext, useState } from 'react'
import type { FileNode } from '@/lib/parser'


type TreeContextType = {
  tree: FileNode[] | null
  setTree: (tree: FileNode[]) => void
}

const TreeContext = createContext<TreeContextType | null>(null)

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [tree, setTree] = useState<FileNode[] | null>(null)

  return (
    <TreeContext.Provider value={{ tree, setTree }}>
      {children}
    </TreeContext.Provider>
  )
}


export function useTree() {
  const ctx = useContext(TreeContext)
  if (!ctx) throw new Error('useTree must be used within a TreeProvider')
  return ctx
}