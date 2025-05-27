// src/app/api/ask
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(request: NextRequest){
    try{
        const {path: relativePath, question} = (await request.json()) as {
            path?: string
            question: string
        }

        let context = ''
        if(relativePath){
            const absolutePath = path.resolve(process.cwd(), relativePath)
            const content = await fs.readFile(absolutePath, 'utf-8')
            context = content
        }

        const response = await ai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {role: 'system', content: [
                                          'You are a helpful code assistant.',
                                          'Answer in ::Markdown:: only.',
                                          'Structure your reply as: ',
                                          '- A new paragraph for the part of the reply',
                                          '- A new paragraph and Bullet points (`- `) for each key answer item.',
                                          'Do not include any plain‐text apology or extra commentary.'
                                        ].join(' ')},
                {role: 'user', content: `code:\n\n${context}`},
                {role: 'user', content: `Question:\n\n${question}`}
              ],
              temperature: 0.2,
            })
            const answer = response.choices[0].message.content?.trim() ?? ''
              return NextResponse.json({ answer })
          } catch (err: any) {
              console.error('Error in /api/ask:', err)
              return NextResponse.json({ error: err.message }, { status: 500 })
        }
}