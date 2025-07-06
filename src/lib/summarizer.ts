// src/lib/summarizer.ts

import OpenAI from 'openai';

const cache = new Map<string, string>();
/**
 * Summarize arbitrary code/text via OpenAI.
 * @param key  Unique cache key (usually the file path)
 * @param text The full text of the file
*/


export async function summarizeText(key: string, text: string): Promise<string> {
  if(cache.has(key)) return cache.get(key)!
  
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
          `You are an expert at analyzing and summarizing digital content. Your goal is to help users understand any file—whether it’s code, documentation, creative writing, or academic text.

You are given a file with a specific 'path' and 'content'. Analyze and summarize it in a comprehensive, structured, and helpful way, adapting your summary style to the file’s type.

---

### 🔍 If the file is a **code file**:
- Clearly explain **what the file does overall**.
- Break down the **key functions, classes, or components**:
  - For each function/class: summarize its **purpose**, **inputs**, **outputs**, and **how it fits into the file**.
- Mention **important constants, config values, types, or data structures**.
- Describe any **notable algorithms, patterns, or side effects**.
- If it’s a UI file (e.g., React), mention key UI elements, hooks, and user flows.
- If the file seems like config (e.g., '.eslintrc', 'vite.config.ts'), summarize what it configures and why.

---

### 📖 If the file is a **non-code file**:
- Determine what kind of file it is: story, essay, note, research paper, etc.
- If it’s a **story/novel**, provide a **comprehensive plot summary**, including:
  - Setting, characters, conflict, climax, and resolution.
  - Key themes, motifs, or ideas.
  - Try to make it like a "shorter version of the book"—not just a few lines.
- If it’s an **essay, article, or documentation**:
  - Summarize the **main arguments or sections**.
  - Mention any examples, sources, or case studies.
  - Explain the **conclusion or takeaway** in a clear sentence.

---

### 🎯 General Summary Guidelines:
- Your goal is to **teach and inform the user**—not just compress the content.
- Be **clear, accurate, and informative**, not vague or overly short.
- Format your response in clean, readable Markdown:
  - Use headings, bullet points, or paragraphs as appropriate.
  - Avoid overly technical terms unless needed.

---

Generate only the structured summary. Do not include commentary about what you're doing.
Use emojis if needed. good formatting. adn bold headers.
          `
          
        ].join(" "),
      },
      { role: "user", content: `Summarize this code:\n\n${text}` },
    ],
    temperature: 0.2,
  });
  
  // 1) Pull out the content
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned no summary');
  }
  
  // 2) Trim and cache
  const summary = content.trim();
  cache.set(key, summary);
  return summary;
}


