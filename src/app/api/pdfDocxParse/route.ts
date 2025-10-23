//src\app\api\pdfDocxParse\route.ts

import { NextResponse } from "next/server";

import mammoth from "mammoth";
import type { Canvas } from 'canvas';
// const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
// pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
// pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
type TextItem = { str: string };

// import mammoth from 'mammoth'

export const runtime = "nodejs"; // not 'edge'

function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

async function setupNodeCanvas() {
   if (typeof window === 'undefined') {
    const canvas = await import('canvas');
    
    // Set up canvas polyfills for Node environment
    // @ts-ignore
    globalThis.ImageData = canvas.ImageData;
    
    if (!globalThis.Path2D) {
      // @ts-ignore
      globalThis.Path2D = class Path2D {
        constructor() { return {} }
      };
    }

  return canvas;
   }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      console.error("[pdfDocxParse] No file provided");
      return NextResponse.json({ error: "No uploaded file" }, { status: 400 });
    }

    console.log(
      `[pdfDocxParse] Processing file: ${file.name}, size: ${file.size} bytes`
    );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (buffer.length === 0) {
      console.error(`[pdfDocxParse] Empty file: ${file.name}`);
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    let text = "";
    try {
      if (file.name.endsWith(".pdf")) {

        await setupNodeCanvas();

        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
        const workerSrc = (
          await import("pdfjs-dist/legacy/build/pdf.worker.js")
        ).default;

        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

        // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        console.log(`[pdfDocxParse] Starting PDF parsing: ${file.name}`);
        // get document
        const doc = await (pdfjsLib as any).getDocument({ data: buffer })
          .promise;
        // get pages
        const numPages = doc.numPages;
        console.log(`[pdfDocxParse] PDF pages found: ${numPages}`);
        const content: string[] = [];

        // for each page, copy text
        for (let i = 1; i <= numPages; i++) {
          // get page
          try {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .filter(isTextItem)
              .map((item: { str: string }) => item.str)
              .join(" ");
            content.push(pageText);
          } catch (pageError) {
            console.error(
              `[pdfDocxParse] Error processing page ${i}:`,
              pageError
            );
            throw new Error(`Failed to process page ${i}: ${pageError}`);
          }
        }

        text = content.join("\n\n");
      } else if (file.name.endsWith(".docx")) {
        console.log(`[pdfDocxParse] Starting DOCX parsing: ${file.name}`);
        try {
          const result = await mammoth.extractRawText({
            buffer: Buffer.from(arrayBuffer),
          });
          //   get text
          text = result.value;

          if (!text || text.trim().length === 0) {
            throw new Error("No text content extracted from DOCX");
          }
        } catch (err: unknown) {
          console.error(`[pdfDocxParse] DOCX parsing error:`, err);
          return NextResponse.json(
            { error: `Invalid DOCX file format or corrupted file: ${err}` },
            { status: 400 }
          );
        }
      } else {
        console.error(`[pdfDocxParse] Unsupported file type: ${file.name}`);
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    } catch (parseError: unknown) {
      console.error("[pdfDocxParse] Parse error:", parseError);
      if (parseError instanceof Error) {
        return NextResponse.json(
          { error: `Failed to parse file: ${parseError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Unknown parse error occurred while processing ${file.name}` },
        { status: 500 }
      );
    }
    console.log(`[pdfDocxParse] Successfully processed ${file.name}`);
    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("[pdfDocxParse] API Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
