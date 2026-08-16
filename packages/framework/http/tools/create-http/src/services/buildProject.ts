import { getBuildCommand } from '../calculations/getBuildCommand.js';
import { type PackageManager } from '../models/PackageManager.js';
import { runCommandInvocation } from './runCommandInvocation.js';

export async function buildProject(
  projectPath: string,
  packageManager: PackageManager,
): Promise<void> {
  await runCommandInvocation(getBuildCommand(packageManager), projectPath);
}
