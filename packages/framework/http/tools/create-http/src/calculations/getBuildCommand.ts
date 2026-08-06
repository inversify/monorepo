import { type CommandInvocation } from '../models/CommandInvocation.js';
import { type PackageManager } from '../models/PackageManager.js';

export function getBuildCommand(
  packageManager: PackageManager,
): CommandInvocation {
  switch (packageManager) {
    case 'npm':
      return {
        args: ['run', 'build'],
        command: 'npm',
      };
    case 'pnpm':
      return {
        args: ['run', 'build'],
        command: 'pnpm',
      };
    case 'yarn':
      return {
        args: ['run', 'build'],
        command: 'yarn',
      };
  }
}
