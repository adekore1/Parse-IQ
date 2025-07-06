import { FileNode } from "./parser"
import OpenAI from 'openai';


// const cache = new Map<string, string>();
/**
 * Summarize arbitrary code/text via OpenAI.
 * @param key  Unique cache key (usually the file path)
 * @param text The full text of the file
*/


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

    let content = ''
    for (const file of files){
        content += file.content
        content += '\n'
    }
    const text = content

    let md = ` Project Overview\n\n
            _This README was created by Parse IQ\n\n`;

        try {
              
              const apiKey = process.env.OPENAI_API_KEY;
              if (!apiKey) {
                throw new Error('Missing OPENAI_API_KEY in your environment');
              }
              
              // instantiate here, so env vars are already loaded
              const ai = new OpenAI({ apiKey });
              
              const response = await ai.chat.completions.create({
                model: "gpt-4.1-mini",
                messages: [
                  {
                    role: "system",
                    content: [
                      `You are an expert open-source maintainer, technical writer, and full-stack software engineer.
Your task is to generate a high-quality, professional, and helpful 'README.md' for a codebase based on its file tree.
Use emojis where needed for a friendly view.

iF YOU ENCOUNTER A DIRECTORY WITH NO CODE, JUST MAKE A README EXPLAINING TEH CONTENT OF THE DIRECTORY, AS WELL AS ANYTHING YOU DEEM FIT.
Use the following file structure:  `
                      
                    ].join(" "),
                  },
                  { role: "user", content: `make a readME of this content:\n\n${text}` },
                ],
                temperature: 0.2,
              });
              
              // 1) Pull out the content
              const content = response.choices[0].message.content;
              if (!content) {
                throw new Error('OpenAI returned no readME');
              }
              
              // 2) Trim and cache
              const summary = content.trim();
            md += `${summary}\n\n`
        } catch {
            console.warn(`error with readME generation.`)
        }
    // }

    return md;
}