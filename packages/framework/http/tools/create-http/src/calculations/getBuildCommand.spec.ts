import { beforeAll, describe, expect, it } from 'vitest';

import { type CommandInvocation } from '../models/CommandInvocation.js';
import { PackageManager } from '../models/PackageManager.js';
import { getBuildCommand } from './getBuildCommand.js';

describe(getBuildCommand, () => {
  describe.each([
    [
      PackageManager.npm,
      { args: ['run', 'build'], command: PackageManager.npm },
    ],
    [
      PackageManager.pnpm,
      { args: ['run', 'build'], command: PackageManager.pnpm },
    ],
    [
      PackageManager.yarn,
      { args: ['run', 'build'], command: PackageManager.yarn },
    ],
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
