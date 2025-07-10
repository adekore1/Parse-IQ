// src/app/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    // <div className="shadow-2xl min-h-full overflow-auto">
    //   <FileExplorer />
    // </div>
    <main className="min-h-screen bg-[#242428] text-white px-6 py-16 space-y-24 overflow-auto">
      {/* HERO */}

      <section className="bg-[#242424] flex justify-center items-center rounded-xl p-6 shadow-2xl">
  <div className="p-6 max-w-[800px] bg-[#242428] rounded-xl shadow-lg text-center w-full">
    
    {/* Heading */}
    <div className="mb-4 text-4xl text-white font-bold tracking-wide">
      <p>WELCOME TO PARSE-IQ</p>
    </div>

    {/* Subheadline */}
    <div className="mb-6">
      <p className="text-green-300 text-lg">
        Instantly understand codebases with AI-powered file parsing, documentation, and chat.
      </p>
    </div>

    {/* CTA Button */}
    <Link
      href="/explorer"
      className="inline-block mt-4 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-400 transition-all duration-200"
    >
      Use me →
    </Link>

    {/* Extra subhead */}
    <div className="mt-6 text-gray-400 text-sm">
      <p>
        ParseIQ helps developers navigate unfamiliar codebases in seconds.
      </p>
    </div>

  </div>
</section>


      {/* FEATURES AND TECH USED */}
      <h2 className="text-center text-3xl font-bold">FEATURES</h2>
      <section className="flex flex-wrap gap-5 justify-center ">
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">🧠 AI Code Parsing</h2>
            <p className="text-sm text-center ">
              Analyzes source code and understands structure and logic
              automatically.
            </p>
          </div>
        </div>
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">📄 Auto Summaries</h2>
            <p className="text-sm text-center ">
              Generates summaries for each file and folder instantly.
            </p>
          </div>
        </div>
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">💬 Code Chat</h2>
            <p className="text-sm text-center ">
              Ask questions about the codebase using natural language.
            </p>
          </div>
        </div>
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">🔗 GitHub Integration</h2>
            <p className="text-sm text-center ">Coming Soon.</p>
          </div>
        </div>
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">📁 File Explorer</h2>
            <p className="text-sm text-center ">
              Clean UI for browsing files with summary popups.
            </p>
          </div>
        </div>
        <div className="border-[#3d3d42] text-white border-1 rounded-xl p-5 w-[300px] bg-[#2f2f33] ">
          <div id="feature-container">
            <h2 className="text-xl font-bold mb-2">⚡ Zero Config</h2>
            <p className="text-sm text-center ">
              Just paste or upload. No setup required.
            </p>
          </div>
        </div>
      </section>

      {/* <section className="px-6 py-12">


      {/* FOOTER */}
      <footer className="bg-[#242424] text-white text-center px-4 py-8 mt-24">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tech Used</h2>
          <p className="text-sm text-gray-400">
            Next.js • TypeScript • TailwindCSS • OpenAI API • React
          </p>

          {/* Optional Social or Repo Links */}
          <div className="flex justify-center gap-4 mt-4">
            <a
              href="https://github.com/Parse-IQ" // replace with actual link
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white underline"
            >
              GitHub Repo
            </a>
            <a
              href="https://linkedin.com/in/adekore-balogun" // optional
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white underline"
            >
              LinkedIn
            </a>
          </div>

          <p className="text-xs text-white mt-6">
            © {new Date().getFullYear()} Adekore Balogun • All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
