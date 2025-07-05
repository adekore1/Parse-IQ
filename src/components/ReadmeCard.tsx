// src\components\ReadmeCard.tsx
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
  }, []);

  if (loading) return <p>Loading README...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!md) return null;

  return (
    <div className="my-4 p-4 border rounded bg-gray-50 overflow-auto">
      <h4 className="font-semibold">📄 README</h4>
      <div className="max-h-[70vh] overflow-y-auto mt-2 p-2 border rounded bg-white">
        <ReactMarkdown>{md}</ReactMarkdown>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          const blob = new Blob([md], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "README.md";
          a.click();
        }}
      >
        Download README as .Md
      </button>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          // 1) Instantiate a PDF doc
          const doc = new jsPDF({
            unit: "pt",
            format: "letter",
            compress: true,
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
          const filename = "README.pdf";
          doc.save(filename);
        }}
      >
        Download README as PDF
      </button>
    </div>
  );
}
