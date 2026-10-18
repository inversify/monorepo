import { PrismaContainerModule } from '@inversifyjs/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { resetDb } from '../../../../../generated/prisma-migrate/index.js';
import { DATABASE_URL } from '../../../models/databaseUrl.js';

export class DbContainerModule extends ContainerModule {
  constructor() {
    super(async (options: ContainerModuleLoadOptions): Promise<void> => {
      await resetDb(DATABASE_URL);
      await this.#buildPrismaContainerModule().load(options);
    });
  }

  #buildPrismaContainerModule(): ContainerModule {
    return new PrismaContainerModule({
      adapter: {
        build: (options: { url: string }) =>
          new PrismaBetterSqlite3({ url: options.url }),
      },
      options: {
        value: {
          url: DATABASE_URL,
        },
      },
      PrismaClient,
    });
  }
}
