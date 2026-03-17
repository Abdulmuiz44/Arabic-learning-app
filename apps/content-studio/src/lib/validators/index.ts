import type { ContentDocumentContract } from '../contracts';

export const validateContract = (contract: ContentDocumentContract): string[] => {
  const diagnostics: string[] = [];

  if (!contract.id.trim()) diagnostics.push('Missing content id.');
  if (!contract.locale.trim()) diagnostics.push('Missing locale.');
  if (!contract.version.trim()) diagnostics.push('Missing version.');

  return diagnostics;
};
