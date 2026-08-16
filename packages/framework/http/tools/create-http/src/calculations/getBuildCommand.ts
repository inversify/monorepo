import { type CommandInvocation } from '../models/CommandInvocation.js';
import { PackageManager } from '../models/PackageManager.js';

export function getBuildCommand(
  packageManager: PackageManager,
): CommandInvocation {
  switch (packageManager) {
    case PackageManager.npm:
      return {
        args: ['run', 'build'],
        command: PackageManager.npm,
      };
    case PackageManager.pnpm:
      return {
        args: ['run', 'build'],
        command: PackageManager.pnpm,
      };
    case PackageManager.yarn:
      return {
        args: ['run', 'build'],
        command: PackageManager.yarn,
      };
  }
}
