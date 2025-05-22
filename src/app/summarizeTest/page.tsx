import { summarizeText } from "@/lib/summarizer";


export default async function testSummarizer() {

    const sampleCode = `
        //A tiny example function to add, which goes as
        export function add(a,b) {
        return a+b;
        }
    `;

    const summary = await summarizeText('demo', sampleCode);

    return (
        <main>
            <h1>Demo Summary</h1>
                <pre style={{ whiteSpace: 'pre-wrap', padding: '1 rem' }}>
                    {summary}
                </pre>
        </main>
  );
}