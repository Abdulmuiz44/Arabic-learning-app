import path from 'node:path';
import { formatIssues, validateContent } from './lib.mjs';
import { loadContentFromFolder, writeCanonicalData } from './io.mjs';

const root = process.cwd();
const sourceFolder = path.join(root, 'content-source');
const outFolder = path.join(root, 'src', 'data');

loadContentFromFolder(sourceFolder)
  .then((raw) => {
    const result = validateContent(raw);
    if (result.issues.length || !result.content) {
      console.error('Content build failed because validation failed:\n');
      console.error(formatIssues(result.issues));
      process.exit(1);
    }
    return writeCanonicalData(outFolder, result.content);
  })
  .then(() => {
    console.log('Content build succeeded. Canonical files were written to src/data/*.json');
  })
  .catch((error) => {
    console.error('Unhandled build error:\n', error);
    process.exit(1);
  });
