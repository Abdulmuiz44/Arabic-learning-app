import { printDiagnostics } from '../../lib/diagnostics';
import { normalizeContract } from '../../lib/normalizers';
import { validateContract } from '../../lib/validators';

export const runReadinessChecks = (): void => {
  const normalized = normalizeContract({
    id: 'sample-content',
    locale: ' AR ',
    version: '0.1.0',
  });

  const diagnostics = validateContract(normalized);
  printDiagnostics(diagnostics);
};
