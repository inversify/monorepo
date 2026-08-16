import path from 'node:path';

const NPM_PACKAGE_NAME_MAX_LENGTH: number = 214;
const FALLBACK_PACKAGE_NAME: string = 'app';

export function resolveProjectPath(targetPath: string): string {
  return path.resolve(targetPath);
}

export function normalizePackageName(name: string): string {
  const normalizedName: string = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[._-]+/, '')
    .replace(/[._-]+$/, '')
    .slice(0, NPM_PACKAGE_NAME_MAX_LENGTH)
    .replace(/[._-]+$/, '');

  return normalizedName === '' ? FALLBACK_PACKAGE_NAME : normalizedName;
}

export function resolvePackageName(projectPath: string): string {
  return normalizePackageName(path.basename(projectPath));
}
