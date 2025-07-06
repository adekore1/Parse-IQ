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
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [path, content]);

  if (loading) return <p className="text-sm text-gray-400">Loading summary…</p>;
  if (error) return <p className="text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="bg-[#242428] p-4 rounded text-gray-200 text-sm shadow-sm">
      <h4 className="text-gray-300 font-semibold mb-2">📄 Summary:</h4>

      <div className="max-h-[65vh] overflow-y-auto rounded bg-[#1f1f24] p-4 text-gray-300 prose prose-invert">
        <ReactMarkdown>{md}</ReactMarkdown>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
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
          Download .Md
        </button>

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
          onClick={() => {
            const doc = new jsPDF({ unit: "pt", format: "letter" });
            const lines = md.split("\n");
            let y = 40;
            doc.setFontSize(12);
            for (const line of lines) {
              doc.text(line, 40, y);
              y += 16;
              if (y > 800) {
                doc.addPage();
                y = 40;
              }
            }
            const filename = path.replace(/\//g, "_") + ".pdf";
            doc.save(filename);
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
