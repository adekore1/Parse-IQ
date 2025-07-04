// src/components/SummaryCard.tsx
"use client";
import { jsPDF } from "jspdf";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface SummaryCardProps {
  path: string;
  content?: string;
}

export default function SummaryCard({ path, content }: SummaryCardProps) {
  const [md, setMd] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // reset state
    setMd("");
    setError(null);
    setLoading(true);

    async function load() {
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || res.statusText);
        const { summary } = await res.json();
        setMd(summary);
      } catch (e: unknown) {
        console.error(e);
        if(e instanceof Error){
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [path, content]);

  if (loading) return <p>Loading summary…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  return (
    <div className="bg-gray-50 p-4 rounded flex flex-col h-full">
      <h4 className="font-semibold">📄 Summary:</h4>

      <div className="flex-1 overflow-y-auto border p-2 rounded bg-white mb-4 max-h-[70vh]">
        <ReactMarkdown>{md}</ReactMarkdown>
      </div>

      <div className="flex gap-2 mt-4 ">
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            const blob = new Blob([md], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const filename = path.replace(/\//g, "_") + ".md";
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download Summary as .Md
        </button>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            // 1) Instantiate a PDF doc
            const doc = new jsPDF({
              unit: "pt",
              format: "letter",
            });

            // 2) Split your Markdown into lines (or strip markdown syntax first)
            const lines = md.split("\n");
            let y = 40; // start a bit down from top
            doc.setFontSize(12);

            for (const line of lines) {
              doc.text(line, 40, y);
              y += 16;
              if (y > 800) {
                // simple page-break logic
                doc.addPage();
                y = 40;
              }
            }

            // 3) Save the PDF
            const filename = path.replace(/\//g, "_") + ".pdf";
            doc.save(filename);
          }}
        >
          Download Summary as PDF
        </button>
      </div>
    </div>
  );
}
