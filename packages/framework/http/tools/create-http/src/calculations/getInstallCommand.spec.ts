import { beforeAll, describe, expect, it } from 'vitest';

import { type CommandInvocation } from '../models/CommandInvocation.js';
import { type PackageManager } from '../models/PackageManager.js';
import { getInstallCommand } from './getInstallCommand.js';

describe(getInstallCommand, () => {
  describe.each([
    ['npm', { args: ['install'], command: 'npm' }],
    ['pnpm', { args: ['install'], command: 'pnpm' }],
    ['yarn', { args: ['install'], command: 'yarn' }],
  ] as const)(
    'having package manager %s',
    (packageManager: PackageManager, expected: CommandInvocation) => {
      describe('when called', () => {
        let result: CommandInvocation;

        beforeAll(() => {
          result = getInstallCommand(packageManager);
        });

        it('should return the install command invocation', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
