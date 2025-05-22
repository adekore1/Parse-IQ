// src/types/node-summary.d.ts
declare module 'node-summary' {
  /**
   * Extractive summarization function:
   * @param title A dummy title (we just pass "doc")
   * @param content The text to summarize
   * @param callback Callback called with (err, summary)
   */
  function summarize(
    title: string,
    content: string,
    callback: (err: Error | null, summary: string) => void
  ): void;

   /** Summarize a web page at the given URL */
  function summarizeFromUrl(
    url: string,
    callback: (err: Error | null, summary: string) => void
  ): void;

  function getSortedSentences(
    title: string,
    content: string,
    n: number
  ): string[];


  export = { summarize, getSortedSentences };
}
