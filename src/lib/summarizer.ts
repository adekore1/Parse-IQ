// import * as summary from 'node-summary';
const summary = require('node-summary');
console.log(Object.keys(summary));

const cache = new Map<string , string>();

/**
* Summarize a block of text extractively.
* @param key  Unique cache key (e.g. file path)
* @param text Raw code or concatenated summaries
* @returns abbreviated summary
*/

export async function summarizeText(key: string, text: string): Promise<string> {

    if (cache.has(key)){
        return cache.get(key)!;
    }

    console.log('summarizeText is:', typeof summarizeText);

    const result = await new Promise<string>((resolve,reject) => {
        summary.summarize('doc', text, (err:Error | null, extracted: string) => {

            if(err) return reject(err);
            // console.log(summary);
            resolve(extracted);
        });
    });

    cache.set(key, result);
    return result; 
}

