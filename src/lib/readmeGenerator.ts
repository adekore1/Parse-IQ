import path from 'path'
import { FileNode } from "./parser"
import { parseDirectory } from "./parser"
import { summarizeText } from "./summarizer";
import OpenAI from 'openai';


function flattenFiles(nodes: FileNode[], out: FileNode[] = []){
    for(const n of nodes){
        if(n.isDirectory && n.children){
            flattenFiles(n.children, out);
        }
        else if(!n.isDirectory && typeof n.content === 'string'){
            out.push(n);
        }
    }
    return out;
}

export async function generateReadme(tree: FileNode[]): Promise<string>{

    const files = flattenFiles(tree);

    let md = ` Project Overview\n\n
            _This README was created by FlowDoc_\n\n
            >>> File Summaries <<<\n\n`;

    for (const file of files){
        md += `->>> ${file.path}\n\n`;

        try {
            // const summary = await summarizeText(file.path, file.content!)
            
            const summary = await summarizeText(file.path, file.content!);

            md += `${summary}\n\n`
        } catch (err: any) {
            console.warn(`▶️ Skipping ${file.path}:`, err.message)
        }
    }

    return md;
}