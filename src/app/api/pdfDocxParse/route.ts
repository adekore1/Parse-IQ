//src\app\api\pdfDocxParse\route.ts

import { NextRequest, NextResponse } from "next/server";
const mammoth = require("mammoth");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
type TextItem = { str: string };

// import mammoth from 'mammoth'

export const runtime = "nodejs"; // not 'edge'

function isTextItem(item: any): item is TextItem {
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
        console.log("Parsing PDF:", file.name);
        // get document
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        // get pages
        const numPages = doc.numPages;
        let content: string[] = [];

        // for each page, copy text
        for (let i = 1; i <= numPages; i++) {
            // get page
          const page = await doc.getPage(i);
        //   get text
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter(isTextItem)
            .map((item: { str: any }) => item.str)
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
        } catch (err: any) {
          return NextResponse.json(
            { error: "Invalid DOCX file format or corrupted file." },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    } catch (parseError: any) {
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { error: `Failed to parse file: ${parseError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("[pdfDocxParse] API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
