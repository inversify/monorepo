import { spawn } from 'node:child_process';
import process from 'node:process';

import { type CommandInvocation } from '../models/CommandInvocation.js';

export async function runCommandInvocation(
  invocation: CommandInvocation,
  cwd: string,
): Promise<void> {
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  await new Promise<void>(
    (resolve: () => void, reject: (error: Error) => void) => {
      const childProcess: ReturnType<typeof spawn> = spawn(
        invocation.command,
        [...invocation.args],
        {
          cwd,
          env: process.env,
          shell: process.platform === 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      childProcess.stdout?.on('data', (chunk: Buffer) => {
        stdoutChunks.push(chunk);
      });

      childProcess.stderr?.on('data', (chunk: Buffer) => {
        stderrChunks.push(chunk);
      });

      childProcess.on('error', (error: Error) => {
        reject(error);
      });

      childProcess.on('close', (exitCode: number | null) => {
        if (exitCode === 0) {
          resolve();
          return;
        }

        const stdout: string = Buffer.concat(stdoutChunks)
          .toString('utf8')
          .trim();
        const stderr: string = Buffer.concat(stderrChunks)
          .toString('utf8')
          .trim();
        const details: string = stderr !== '' ? stderr : stdout;
        const commandLine: string = [
          invocation.command,
          ...invocation.args,
        ].join(' ');

        reject(
          new Error(
            details === ''
              ? `Command "${commandLine}" failed with exit code ${String(exitCode)}.`
              : `Command "${commandLine}" failed with exit code ${String(exitCode)}:\n${details}`,
          ),
        );
      });
    },
  );
}
