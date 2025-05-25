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
      {role: 'system', content: 'You are an expert code summarizer, explain what each function does, and specify what function does what, including function names and usability.'},
      {role: 'user', content: `Summarize this code in plain English:\n\n${text}`},
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
