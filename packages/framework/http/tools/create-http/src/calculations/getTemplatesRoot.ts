import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getTemplatesRoot(): string {
  const moduleDirectory: string = path.dirname(fileURLToPath(import.meta.url));

  return path.resolve(moduleDirectory, '../../templates');
}

export function getBaseTemplateRoot(): string {
  return path.join(getTemplatesRoot(), 'base');
}
