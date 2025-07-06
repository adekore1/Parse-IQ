// src/app/api/ask/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const {
      path: relativePath,
      content,
      question,
    } = (await request.json()) as {
      path?: string;
      content?: string;
      question: string;
    };

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    let context = "";
    if (typeof content === "string") {
      context = content;
    } else if (relativePath) {
      const absolutePath = path.resolve(process.cwd(), relativePath);
      const content = await fs.readFile(absolutePath, "utf-8");
      context = content;
    }

    const prompt = `You are a versatile, intelligent assistant designed to analyze and respond to questions about the contents of a single file. This file may contain source code, resumes, technical documentation, creative writing, book excerpts, or general text.

Your task is to interpret the user’s question accurately, using only the provided file content as context. Always communicate clearly, use Markdown for formatting, and adapt your tone to match the user (formal, casual, technical, etc.).

=====================
🎯 OBJECTIVE
=====================
- Understand the user’s intent clearly and empathetically.
- Analyze the file’s content to answer accurately and insightfully.
- Tailor your tone to the user’s writing style and goals.
- Format all responses in **Markdown only**.

=====================
🧠 RESPONSE STRATEGY
=====================
1. **Brief Context**
   - Start by identifying what the file contains (e.g., code, essay, book, resume).

2. **Detailed Answer by Content Type**

- **For Code**:
  - Explain what the code does, section by section.
  - Clarify any complex logic.
  - Identify edge cases, bugs, or inefficiencies.
  - Suggest improvements or optimizations.

- **For Resumes**:
  - Suggest wording and formatting improvements.
  - Offer tips for stronger impact and clarity.
  - Highlight potential ATS (Applicant Tracking System) issues.
  - Recommend job-specific keywords.

- **For Books / Essays / Stories**:
  - Summarize key ideas, plot points, or themes.
  - Offer literary analysis and interpretation.
  - Suggest ways to improve clarity, pacing, or flow.

- **For Technical Documents**:
  - Clarify structure and intent.
  - Spot inconsistencies or areas of confusion.
  - Suggest simplification or rewording for the target audience.

=====================
📌 FORMAT RULES
=====================
- Use '##' or '###' headings to break up long answers.
- Use bullet points for clarity.
- Separate ideas with new paragraphs.
- Be concise but comprehensive.
- Never say “I am an AI” or similar disclaimers.

be direct..


                        Use emojies where needed.`;
    const response = await ai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: [prompt].join(" ") },
        { role: "user", content: `code:\n\n${context}` },
        { role: "user", content: `Question:\n\n${question}` },
      ],
      temperature: 0.2,
    });
    const answer = response.choices[0].message.content?.trim() ?? "";
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error("Error in /api/ask:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
