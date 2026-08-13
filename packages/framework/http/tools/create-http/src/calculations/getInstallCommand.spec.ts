import { beforeAll, describe, expect, it } from 'vitest';

import { type CommandInvocation } from '../models/CommandInvocation.js';
import { PackageManager } from '../models/PackageManager.js';
import { getInstallCommand } from './getInstallCommand.js';

describe(getInstallCommand, () => {
  describe.each([
    [PackageManager.npm, { args: ['install'], command: PackageManager.npm }],
    [PackageManager.pnpm, { args: ['install'], command: PackageManager.pnpm }],
    [PackageManager.yarn, { args: ['install'], command: PackageManager.yarn }],
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
