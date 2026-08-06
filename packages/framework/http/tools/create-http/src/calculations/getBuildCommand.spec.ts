import { beforeAll, describe, expect, it } from 'vitest';

import { type CommandInvocation } from '../models/CommandInvocation.js';
import { type PackageManager } from '../models/PackageManager.js';
import { getBuildCommand } from './getBuildCommand.js';

describe(getBuildCommand, () => {
  describe.each([
    ['npm', { args: ['run', 'build'], command: 'npm' }],
    ['pnpm', { args: ['run', 'build'], command: 'pnpm' }],
    ['yarn', { args: ['run', 'build'], command: 'yarn' }],
  ] as const)(
    'having package manager %s',
    (packageManager: PackageManager, expected: CommandInvocation) => {
      describe('when called', () => {
        let result: CommandInvocation;

        beforeAll(() => {
          result = getBuildCommand(packageManager);
        });

        it('should return the build command invocation', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
