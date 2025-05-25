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

export async function generateReadme(): Promise<string>{
    const srcRoot = path.join(process.cwd(), 'src')
    const tree = await parseDirectory(srcRoot, srcRoot)

    const files = flattenFiles(tree);

    let md = `# Auto-Generated README\n\n
            _This README was created by FlowDoc_\n\n
            ## File Summaries\n\n`;

    for (const file of files){
        md += `### ${file.path}\n\n`;

        try {
            // const summary = await summarizeText(file.path, file.content!)
            
            const apiKey = process.env.OPENAI_API_KEY;
              if (!apiKey) {
                throw new Error('Missing OPENAI_API_KEY in your environment');
              }
            
              // instantiate here, so env vars are already loaded
              const ai = new OpenAI({ apiKey });
            
              const response = await ai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {role: 'system', content: [
                    'You are an expert developer documentation assistant.',
                    'When given a single source file, you produce a concise README section that explains:',
                    '- The purpose of the file (what problem it solves),',
                    '- The main exports or functions it defines,',
                    '- Any notable implementation details.',
                    'Format your answer as plain markdown (no code blocks).',
                    'Make it easily readable, to make workflow easier, communication between teams and new workers in teh team',
                    'Explain how to use teh functions, and where each function can be used across files.',
                    'use bulletpoints and indentations and file formatting for easy redability.'
                    ].join(' ')
                 },
                  {role: 'user', content: `Generate a README entry for **${file.path}**:\n\n${file.content}`},
                ],
                temperature: 0.2,
              })
            
               // 1) Pull out the content
              const summary = response.choices[0].message.content;
              if (!summary) {
                throw new Error('OpenAI returned no summary');
              }
            
            md += `${summary}`
        } catch (e: any) {
            console.warn(`▶️ Skipping ${file.path}:`, e.message)
        }
    }

    return md;
}