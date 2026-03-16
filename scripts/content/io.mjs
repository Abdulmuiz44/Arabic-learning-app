import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CONTENT_KEYS } from './lib.mjs';

export async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

export async function loadContentFromFolder(folderPath) {
  const result = {};
  for (const key of CONTENT_KEYS) {
    const jsonPath = path.join(folderPath, `${key}.json`);
    result[key] = await readJsonFile(jsonPath);
  }
  return result;
}

export async function writeCanonicalData(outputPath, content) {
  await fs.mkdir(outputPath, { recursive: true });
  for (const key of CONTENT_KEYS) {
    const filePath = path.join(outputPath, `${key}.json`);
    await fs.writeFile(filePath, `${JSON.stringify(content[key], null, 2)}\n`, 'utf8');
  }
}
