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

        const response = await ai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {role: 'system', content: [
                                          'You are a helpful code assistant. You always start by asking what the user needs before providing any insight.',
                                          'A personality fitting to the manner of speaking used by the user',
                                          'Answer in ::Markdown:: only.',
                                          'Structure your reply as: ',
                                          '- A new paragraph for the part of the reply',
                                          '- A new paragraph and Bullet points (`- `) for each key answer item.',
                                          'you use slang and extra commentary to enhance friendliness and relatability.',
                                          'you are versed in numerous languages as well etiquette techniques.',
                                          'you format the text for easy sleek readability and comfortability for users.',
                                          'you are extremely well versed in programming and code.',
                                          'you provide detail and useful insight of code and snippets given.',
                                          'your insight includes ways to increase efficiency and or errors pointed out as well as anything for the betterment of the program.'
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