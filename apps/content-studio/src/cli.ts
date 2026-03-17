import { runExport } from './features/export';
import { runPreviewSummary } from './features/preview';
import { runReadinessChecks } from './features/readiness';

const command = process.argv[2];

switch (command) {
  case 'validate':
    runReadinessChecks();
    break;
  case 'export':
    runExport();
    break;
  case 'summary':
    runPreviewSummary();
    break;
  default:
    console.log('Usage: node dist/cli.js [validate|export|summary]');
    process.exitCode = 1;
}
