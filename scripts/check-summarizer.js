// scripts/check-summarizer.js
const { summarizeText } = require('../dist/lib/summarizer.js');

// Self-invoking async wrapper
;(async () => {
  const sample = `
    // A simple add function
    export function add(a: number, b: number) {
      return a + b;
    }
  `;
  try {
    const summary = await summarizeText('demo-add', sample);
    // const top3 = summary.getSortedSentences('doc', code, 3);
    // const fallback = top3.join(' ').trim();
    console.log('✅ Summary:', summary);

  } catch (err) {
    console.error('❌ Summarization failed:', err);
  }
})();
