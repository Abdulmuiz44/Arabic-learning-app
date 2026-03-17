import path from 'node:path';
import { formatGroupedIssues, issueCountsBySeverity, validateContent } from './lib.mjs';
import { loadContentFromFolder } from './io.mjs';

const root = process.cwd();
const dataFolder = path.join(root, 'src', 'data');

loadContentFromFolder(dataFolder)
  .then((raw) => {
    const result = validateContent(raw);
    const counts = issueCountsBySeverity(result.issues);

    console.log(`Validation target: ${dataFolder}`);
    console.log(formatGroupedIssues(result.issues));
    console.log(`\nTotals: ${counts.error || 0} error(s), ${counts.warning || 0} warning(s)`);

    if ((counts.error || 0) > 0) process.exit(1);
  })
  .catch((error) => {
    console.error('Unhandled validation error:\n', error);
    process.exit(1);
  });
