"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { FileNode } from "@/lib/parser";

interface ReadmeCardProps {
  tree: FileNode[];
}

export default function ReadmeCard({ tree }: ReadmeCardProps) {
  const [md, setMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tree || tree.length === 0) {
      setError("No file tree provided");
      return;
    }

    setLoading(true);
    setError(null);

    fetch("/api/readme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tree }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        setMd(data.markdown);
      })
      .catch((err) => {
        console.error("README fetch failed:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tree]);

  if (loading) return <p className="text-sm text-gray-400">Loading README...</p>;
  if (error) return <p className="text-red-500 text-sm">Error: {error}</p>;
  if (!md) return null;

  return (
    <div className="bg-[#242428] p-4 rounded text-gray-200 text-sm shadow-sm">
      <h4 className="text-gray-300 font-semibold mb-2">📄 README</h4>

      <div className="max-h-[70vh] overflow-y-auto rounded bg-[#1f1f24] p-4 text-gray-300 prose prose-invert">
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
            a.download = "README.md";
            a.click();
          }}
        >
          Download .Md
        </button>

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
          onClick={() => {
            const doc = new jsPDF({
              unit: "pt",
              format: "letter",
              compress: true,
            });

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

            doc.save("README.pdf");
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
