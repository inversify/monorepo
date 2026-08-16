import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { runCommandInvocation } from './runCommandInvocation.js';

describe(runCommandInvocation, () => {
  describe('having a successful command', () => {
    describe('when called', () => {
      let temporaryRoot: string;
      let error: unknown;

      beforeAll(async () => {
        temporaryRoot = await fs.mkdtemp(
          path.join(os.tmpdir(), 'run-command-'),
        );

        try {
          await runCommandInvocation(
            {
              args: ['-e', 'process.exit(0)'],
              command: process.execPath,
            },
            temporaryRoot,
          );
        } catch (caughtError: unknown) {
          error = caughtError;
        }
      });

      afterAll(async () => {
        await fs.rm(temporaryRoot, { force: true, recursive: true });
      });

      it('should resolve without throwing', () => {
        expect(error).toBeUndefined();
      });
    });
  });

  describe('having a failing command', () => {
    describe('when called', () => {
      let temporaryRoot: string;
      let result: unknown;

      beforeAll(async () => {
        temporaryRoot = await fs.mkdtemp(
          path.join(os.tmpdir(), 'run-command-'),
        );

        try {
          await runCommandInvocation(
            {
              args: ['-e', 'console.error("boom"); process.exit(1)'],
              command: process.execPath,
            },
            temporaryRoot,
          );
        } catch (caughtError: unknown) {
          result = caughtError;
        }
      });

      afterAll(async () => {
        await fs.rm(temporaryRoot, { force: true, recursive: true });
      });

      it('should reject with command output', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toContain('exit code 1');
        expect((result as Error).message).toContain('boom');
      });
    });
  });
});
