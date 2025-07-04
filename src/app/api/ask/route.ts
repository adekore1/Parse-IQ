// src/app/api/ask/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(request: NextRequest){
    try{
        const {path: relativePath,content, question} = (await request.json()) as {
            path?: string
            content?: string
            question: string
        }

        if (!question) {
          return NextResponse.json(
            { error: 'Question is required' },
            { status: 400 }
          )
        }

        let context = ''
        if (typeof content === 'string') {
          context = content
        }
        else if(relativePath){
            const absolutePath = path.resolve(process.cwd(), relativePath)
            const content = await fs.readFile(absolutePath, 'utf-8')
            context = content
        }

        const prompt = `You are a helpful, adaptive assistant designed to answer questions about a given file's content. The content could be source code, a resume, technical documentation, a book excerpt, or general text. Your reply must always follow these rules:

                        ## 🎯 Objective:
                        - Interpret the user’s question with empathy and precision.
                        - Use the provided content as context.
                        - Answer using clear, structured **Markdown**.
                        - Tailor your tone to the user’s writing style (formal, casual, technical).

                        ## 🧠 Core Instructions:
                        - Start with a brief contextual introduction.
                        - Answer the user's question in logical sections.
                        - For **code**, include: explanation, improvements, edge cases, and performance tips.
                        - For **resumes**, provide writing tips, impact advice, formatting suggestions, and keyword optimization.
                        - For **books/essays**, explain meaning, theme, and clarity improvements.
                        - For **technical docs**, clarify structure, consistency, gaps, and audience suitability.

                        ## 📌 Format:
                        - Always use new paragraphs between logical ideas.
                        - Use bullet points (-) for clarity.
                        - Use headers (##, ###) to separate sections if the answer is long.
                        - Never break character. Never say "I am an AI" or similar disclaimers.

                        Markdown only.`;
        const response = await ai.chat.completions.create({
              model: 'gpt-4.1-mini',
              messages: [
                {role: 'system', content: [prompt].join(' ')},
                {role: 'user', content: `code:\n\n${context}`},
                {role: 'user', content: `Question:\n\n${question}`}
              ],
              temperature: 0.2,
            })
            const answer = response.choices[0].message.content?.trim() ?? ''
              return NextResponse.json({ answer })
          } catch (err: unknown) {
              console.error('Error in /api/ask:', err)
              return NextResponse.json({ error: err}, { status: 500 })
        }
}