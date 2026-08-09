import { beforeAll, describe, expect, it } from 'vitest';

import { bootstrap, UserService } from './gettingStarted.js';

describe(UserService, () => {
  describe('.createUser', () => {
    describe('having a PostgreSQL PrismaContainerModule', () => {
      describe('when resolved from the container', () => {
        let userService: UserService;

        beforeAll(async () => {
          process.env['DATABASE_URL'] =
            'postgresql://inversify:inversify@127.0.0.1:5432/inversify';

          userService = await bootstrap();
        });

        it('should resolve UserService with an injected Prisma client', () => {
          expect(userService).toBeInstanceOf(UserService);
        });
      });
    });
  });
});
