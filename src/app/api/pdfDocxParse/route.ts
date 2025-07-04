//src\app\api\pdfDocxParse\route.ts

import { NextResponse } from "next/server";

import mammoth from "mammoth";
// const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
// pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
// pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
type TextItem = { str: string };

// import mammoth from 'mammoth'

export const runtime = "nodejs"; // not 'edge'

function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No uploaded file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    let text = "";
    try {
      if (file.name.endsWith(".pdf")) {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
        const workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.js")).default;

        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
        // (pdfjsLib as any).GlobalWorkerOptions.standardFontDataUrl = "/pdf-fonts/";
        console.log("Parsing PDF:", file.name);
        // get document
        const doc = await (pdfjsLib as any).getDocument({ data: buffer }).promise;
        // get pages
        const numPages = doc.numPages;
        const content: string[] = [];

        // for each page, copy text
        for (let i = 1; i <= numPages; i++) {
            // get page
          const page = await doc.getPage(i);
        //   get text
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter(isTextItem)
            .map((item: { str: string }) => item.str)
            .join(" ");
            // add to content array
          content.push(pageText);
        }

        text = content.join("\n\n");
      } else if (file.name.endsWith(".docx")) {
        console.log("Parsing DOCX:", file.name);
        try {
          const result = await mammoth.extractRawText({
            buffer: Buffer.from(arrayBuffer),
          });
        //   get text
          text = result.value;
        } catch (err: unknown) {
          return NextResponse.json(
            { error: `Invalid DOCX file format or corrupted file: ${err}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    } catch (parseError: unknown) {
      console.error("Parse error:", parseError);
      if (parseError instanceof Error) {
        return NextResponse.json(
          { error: `Failed to parse file: ${parseError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Unknown parse error occurred" },
        { status: 500 }
      );
    }

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
