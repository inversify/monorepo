import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { execSync } from 'node:child_process';

import { PrismaPg } from '@prisma/adapter-pg';

import { CreateUserParamsFixtures } from '../../fixtures/CreateUserParamsFixtures.js';
import { PrismaClient, type User } from '../../generated/prisma/index.js';
import { bootstrap, UserService } from './gettingStarted.js';

const DATABASE_URL: string =
  'postgresql://inversify:inversify@127.0.0.1:5432/inversify';

describe(UserService, () => {
  describe('.createUser', () => {
    describe('having a PostgreSQL PrismaContainerModule', () => {
      describe('when called', () => {
        let userService: UserService;
        let result: User;

        beforeAll(async () => {
          process.env['DATABASE_URL'] = DATABASE_URL;

          execSync('pnpm exec prisma migrate deploy', {
            cwd: process.cwd(),
            stdio: 'inherit',
          });

          userService = await bootstrap();
          result = await userService.createUser(
            CreateUserParamsFixtures.any.email,
            CreateUserParamsFixtures.any.name,
          );
        });

        afterAll(async () => {
          const prismaClient: PrismaClient = new PrismaClient({
            adapter: new PrismaPg({ connectionString: DATABASE_URL }),
          });

          try {
            await prismaClient.user.delete({
              where: {
                id: result.id,
              },
            });
          } finally {
            await prismaClient.$disconnect();
          }
        });

        it('should resolve UserService with an injected Prisma client', () => {
          expect(userService).toBeInstanceOf(UserService);
        });

        it('should create a user through the injected Prisma client', () => {
          expect(result).toMatchObject({
            email: CreateUserParamsFixtures.any.email,
            name: CreateUserParamsFixtures.any.name,
          });
          expect(result.id).toBeTypeOf('number');
        });
      });
    });
  });
});
