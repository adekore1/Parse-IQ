// src/app/test/page.tsx
import { parseDirectory } from '@/lib/parser';

// This is a Server Component—runs on the Node server
export default async function TestParser() {
  // parse the project root
  const tree = await parseDirectory(process.cwd(), process.cwd());

  // render the first few nodes as indented JSON
  return (
    <pre style={{ whiteSpace: 'pre-wrap', padding: 16 }}>
      {JSON.stringify(tree.slice(0, 5), null, 2)}
    </pre>
  );
}
