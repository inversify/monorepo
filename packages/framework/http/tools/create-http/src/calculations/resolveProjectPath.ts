import path from 'node:path';

export function resolveProjectPath(targetPath: string): string {
  return path.resolve(targetPath);
}

export function resolvePackageName(projectPath: string): string {
  return path.basename(projectPath);
}
