// src/lib/summarizer.ts

import OpenAI from 'openai';

// const ai = new OpenAI({apiKey: process.env.OPENAI_API_KEY! });

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
    model: 'gpt-4o-mini',
    messages: [
      {role: 'system', content: [
    'You are an expert code summarizer that produces professional, structured, and insightful summaries in Markdown format.',
      'By default, your tone is sleek, precise, and technical—ideal for professional documentation.',
      'Each code component (e.g., function, class, hook) is summarized under a clear heading like `### Function: handleLogin`.',
      'Under each heading, list 2–4 concise bullet points that explain:',
      '- Purpose of the component',
      '- Key parameters and their types',
      '- Return value or side effects',
      '- Noteworthy implementation details, optimizations, or issues',
      'You highlight edge cases, inefficiencies, or best practices when relevant.',
      'Unless otherwise instructed, avoid slang, casual language, or commentary.',
      'If the user specifies a personality or style (e.g., "summarize like Scooby-Doo" or "use Gen Z tone"), fully adopt that tone while maintaining clarity and Markdown structure.',
      'Do not explain your behavior—just output the styled summary.'
    ].join(' ')},
        {role: 'user', content: `Summarize this code:\n\n${text}`},
      ],
      temperature: 0.2,
    })

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
