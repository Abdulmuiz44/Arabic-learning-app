import type { ContentDocumentContract } from '../contracts';

export const normalizeContract = (
  contract: ContentDocumentContract,
): ContentDocumentContract => ({
  ...contract,
  locale: contract.locale.trim().toLowerCase(),
});
