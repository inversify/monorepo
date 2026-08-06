import { runCommandInvocation } from './runCommandInvocation.js';

export async function initializeGitRepository(
  projectPath: string,
): Promise<void> {
  await runCommandInvocation(
    {
      args: ['init'],
      command: 'git',
    },
    projectPath,
  );
}

export async function createInitialGitCommit(
  projectPath: string,
): Promise<void> {
  await runCommandInvocation(
    {
      args: ['add', '-A'],
      command: 'git',
    },
    projectPath,
  );

  await runCommandInvocation(
    {
      args: ['commit', '-m', 'Initial commit'],
      command: 'git',
    },
    projectPath,
  );
}
