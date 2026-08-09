import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { type User } from '../../generated/prisma/index.js';
import { bootstrap, type UserService } from './gettingStarted.js';

describe('gettingStarted', () => {
  describe('when called', () => {
    let userService: UserService;
    let result: User;

    beforeAll(async () => {
      const databasePath: string = path.join(process.cwd(), 'prisma', 'dev.db');

      if (fs.existsSync(databasePath)) {
        fs.unlinkSync(databasePath);
      }

      execSync('pnpm exec prisma migrate deploy', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      userService = await bootstrap();
      result = await userService.createUser('ada@example.com', 'Ada Lovelace');
    });

    afterAll(() => {
      const databasePath: string = path.join(process.cwd(), 'prisma', 'dev.db');

      if (fs.existsSync(databasePath)) {
        fs.unlinkSync(databasePath);
      }
    });

    it('should create a user through the injected Prisma client', () => {
      expect(result).toMatchObject({
        email: 'ada@example.com',
        name: 'Ada Lovelace',
      });
      expect(result.id).toBeTypeOf('number');
    });
  });
});
