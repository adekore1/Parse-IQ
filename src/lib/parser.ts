// src/lib/parser.ts
import fs from 'fs/promises';
import path from 'path';

// define ignored filetypes
const IGNORE = new Set([
  '.git',
  '.node_modules',
  '.next',
  '.vercel'
]);

// define allowed filetypes
const ALLOWED = new Set([
  '.tsx','.ts',
  '.jsx', '.js',
  '.json', '.md'
]);

// INITIALIZE THE FILE NODE

export interface FileNode {
  name: string; // “index.ts” or “components”
  path: string;  // “src/lib/index.ts”
  isDirectory: boolean;  // true for folders, false for files
  children?: FileNode[];  // only present if it’s a folder
  content?: string;  // only present if it’s a file we read
}

// FUNCTION TO PARSE DIRS (takes two inputs, directory and root)

export async function parseDirectory(
  dir: string,
  root: string = dir,
):Promise<FileNode[]> {

  // { withFileTypes: true } tells Node to give you Dirent objects, which have methods like .isDirectory() and the .name property
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const nodes: FileNode[] = [];

  for(const entry of entries) {
    //If this entry is a folder and its name is in our IGNORE set, we skip processing it entirely
    if (entry.isDirectory() && IGNORE.has(entry.name)) {
      continue;
    }

    // absolutePath is the full file-system path (so we can read files), current dir + entry name
    const absolutePath = path.resolve(dir, entry.name);

    // relativePath is how we’ll refer to this node inside our app (path without root)
    const relativePath = path.relative(root, absolutePath);

    // make a node for each entry in entries (file or dir)
    const node: FileNode = {
      name: entry.name,
      path: relativePath,
      isDirectory: entry.isDirectory(),
    };

    // check directory status
    if(entry.isDirectory()) {
      // recursive call to parse to get to the end of the dir
      node.children = await parseDirectory(absolutePath, root);

    }else {

      // get the file extension of the entry
      const ext = path.extname(entry.name);

      // check if it is allowed
      if(ALLOWED.has(ext)) {
        try {

          // read file
          node.content = await fs.readFile(absolutePath, 'utf-8');

        } catch {
          // handle error gracefully
          node.content = '';
        }
      }
    }

    // add to array of nodes
    nodes.push(node);
  }

  // return array of nodes (the tree)
  return nodes;

}