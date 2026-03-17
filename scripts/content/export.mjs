import path from 'node:path';
import { CONTENT_KEYS, formatGroupedIssues, issueCountsBySeverity, validateContent } from './lib.mjs';
import { loadContentFromFolder, writeCanonicalData } from './io.mjs';

const root = process.cwd();
const sourceFolder = path.join(root, 'content-source');
const outFolder = path.join(root, 'src', 'data');

const formatManifestStats = (content) => {
  const recordCount = CONTENT_KEYS.reduce((sum, key) => sum + content[key].length, 0);
  const lines = [
    'Manifest stats:',
    `- files: ${CONTENT_KEYS.length}`,
    `- total records: ${recordCount}`,
  ];

  for (const key of CONTENT_KEYS) {
    lines.push(`- ${key}: ${content[key].length}`);
  }

  return lines.join('\n');
};

loadContentFromFolder(sourceFolder)
  .then((raw) => {
    const result = validateContent(raw);
    const counts = issueCountsBySeverity(result.issues);

    console.log(formatGroupedIssues(result.issues));

    if ((counts.error || 0) > 0 || !result.content) {
      console.error(`\nExport blocked: ${counts.error || 0} error(s), ${counts.warning || 0} warning(s)`);
      process.exit(1);
    }

    return writeCanonicalData(outFolder, result.content).then(() => ({ content: result.content, warningCount: counts.warning || 0 }));
  })
  .then(({ content, warningCount }) => {
    console.log('\nContent export completed successfully.');
    console.log(`Output folder: ${outFolder}`);
    console.log(formatManifestStats(content));
    console.log(`Warnings: ${warningCount}`);
  })
  .catch((error) => {
    console.error('Unhandled export error:\n', error);
    process.exit(1);
  });
