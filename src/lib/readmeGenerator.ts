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
            _This README was created by FlowDoc_\n\n
            >>> File Summaries <<<\n\n`;

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
                      `You are a skilled technical writer. Create a professional and well-structured README for a project named **[Your Project Name]**. It is a [brief description, e.g., "web app for summarizing and exploring codebases"].

                        Include the following sections in markdown format:

                        1. **Project Title**  
                        2. **Overview**  Short, clear summary of what the project does.  
                        3. **Features**  Bullet list of key capabilities.  
                        4. **Installation**  Step-by-step guide to set it up locally.  
                        5. **Usage** How to run and use the project.  
                        6. **API / Commands**  Any APIs or CLI commands (if relevant).  
                        7. **Technologies Used**  Languages, frameworks, libraries.  
                        8. **Contributing**  Guidelines for contributing (if any).  
                        9. **License**  Include license type and any conditions.  
                        10. **Acknowledgements / Credits** (optional)

                        Use clear markdown formatting, appropriate code blocks, and make it beginner-friendly but technically correct.
                      `
                      
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