import { type CommandInvocation } from '../models/CommandInvocation.js';
import { PackageManager } from '../models/PackageManager.js';

export function getInstallCommand(
  packageManager: PackageManager,
): CommandInvocation {
  switch (packageManager) {
    case PackageManager.npm:
      return {
        args: ['install'],
        command: PackageManager.npm,
      };
    case PackageManager.pnpm:
      return {
        args: ['install'],
        command: PackageManager.pnpm,
      };
    case PackageManager.yarn:
      return {
        args: ['install'],
        command: PackageManager.yarn,
      };
  }
}
