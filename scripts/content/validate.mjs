import path from 'node:path';
import { formatIssues, validateContent } from './lib.mjs';
import { loadContentFromFolder } from './io.mjs';

const root = process.cwd();
const dataFolder = path.join(root, 'src', 'data');

loadContentFromFolder(dataFolder)
  .then((raw) => {
    const result = validateContent(raw);
    if (result.issues.length) {
      console.error('Content validation failed:\n');
      console.error(formatIssues(result.issues));
      process.exit(1);
    }
    console.log('Content validation passed for src/data/*.json');
  })
  .catch((error) => {
    console.error('Unhandled validation error:\n', error);
    process.exit(1);
  });
