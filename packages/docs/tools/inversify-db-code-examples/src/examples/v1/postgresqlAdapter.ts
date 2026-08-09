// Begin-example
import { PrismaContainerModule } from '@inversifyjs/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/index.js';

export function createPostgresqlPrismaContainerModule(
  connectionString: string,
): PrismaContainerModule<{ connectionString: string }, never> {
  return new PrismaContainerModule({
    adapter: {
      build: (options: { connectionString: string }) => new PrismaPg(options),
    },
    options: {
      value: {
        connectionString,
      },
    },
    PrismaClient,
  });
}
// End-example
