// src/lib/summarizer.ts

import * as ts from 'typescript';
const summary = require('node-summary');
const cache = new Map<string , string>();

function codeSignatureSummary(text:string): string | null{
    const sf = ts.createSourceFile('x.ts', text, ts.ScriptTarget.Latest, true);

    for(const stmt of sf.statements) {
        if(ts.isFunctionDeclaration(stmt) && stmt.name) {
            const name = stmt.name.text;
            const params = stmt.parameters.map(p => p.name.getText()).join(', ');
            return `Function ${name}(${params})`;
        }

        if (ts.isClassDeclaration(stmt) && stmt.name) {
            const methods = stmt.members
                .filter(ts.isMethodDeclaration)
                .map(m => (m.name as ts.Identifier).text + '(' +
                            ((m.parameters || []).map(p => p.name.getText()).join(', ')) +
                        ')');
            return `Class ${stmt.name.text} with methods: ${methods.join(', ')}`;
        }

        if (ts.isVariableStatement(stmt) && stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            for (const decl of stmt.declarationList.declarations) {
                if (
                ts.isIdentifier(decl.name) &&
                decl.initializer && ts.isArrowFunction(decl.initializer)
                ) {
                const name = decl.name.text;
                const params = decl.initializer.parameters.map(p => p.name.getText()).join(', ');
                return `Function ${name}(${params})`;
                }
            }
        }

    }
    return null;
}


/**
* Summarize a block of text extractively.
* @param key  Unique cache key (e.g. file path)
* @param text Raw code or concatenated summaries
* @returns abbreviated summary
*/

export async function summarizeText(key: string, text: string): Promise<string> {
  if (cache.has(key)) return cache.get(key)!;

  // 1) AST-based summary
  const sig = codeSignatureSummary(text);
  if (sig) {
    cache.set(key, sig);
    return sig;
  }

  // 2) extractive fallback
  const out = await new Promise<string>((resolve, reject) => {
    summary.summarize('doc', text, (err: Error | null, s: string) => {
      if (err) reject(err);
      else resolve(s);
    });
  });

  cache.set(key, out);
  return out
}