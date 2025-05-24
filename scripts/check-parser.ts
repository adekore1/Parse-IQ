// scripts/check-parser.ts
import { parseDirectory } from '../src/lib/parser';
import path from 'path';

(async() => {

    const fixtureRoot = path.join(process.cwd(), 'fixtures', 'simple');

  // 2) Parse only that folder
  const tree = await parseDirectory(fixtureRoot, fixtureRoot);
    // const tree = await parseDirectory(process.cwd(), process.cwd());

    // console.log("First 5 nodes");
    // const stringed_tree = JSON.stringify(tree.slice(0,5),null,2);
    console.log(tree);

    const firstDirectory = tree.find(n => n.isDirectory);
    if (firstDirectory){
        console.log(`This is the first Directory: ${firstDirectory.path}`);
        const firstDirTree = JSON.stringify(firstDirectory.children, null, 2);
        console.log(firstDirTree);
    }
})().catch(err =>{
    console.error(err);
    process.exit(1);
})