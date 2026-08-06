import { type CommandInvocation } from '../models/CommandInvocation.js';
import { type PackageManager } from '../models/PackageManager.js';

export function getInstallCommand(
  packageManager: PackageManager,
): CommandInvocation {
  switch (packageManager) {
    case 'npm':
      return {
        args: ['install'],
        command: 'npm',
      };
    case 'pnpm':
      return {
        args: ['install'],
        command: 'pnpm',
      };
    case 'yarn':
      return {
        args: ['install'],
        command: 'yarn',
      };
  }
}
