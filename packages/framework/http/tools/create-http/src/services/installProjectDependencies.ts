import { getInstallCommand } from '../calculations/getInstallCommand.js';
import { type PackageManager } from '../models/PackageManager.js';
import { runCommandInvocation } from './runCommandInvocation.js';

export async function installProjectDependencies(
  projectPath: string,
  packageManager: PackageManager,
): Promise<void> {
  await runCommandInvocation(getInstallCommand(packageManager), projectPath);
}
