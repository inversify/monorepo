import { DbAdapter, DEFAULT_DB_ADAPTER } from '../../models/DbAdapter.js';
import { type SourceImport } from '../models/BootstrapSourceModel.js';
import { type InitializeContainerSourceModel } from '../models/InitializeContainerSourceModel.js';

const LOGGER_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../logger/containerModules/LoggerContainerModule.js';

const STATUS_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../status/adapter/inversify/containerModules/StatusContainerModule.js';

const TODO_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../todo/adapter/inversify/containerModules/TodoContainerModule.js';

const TODO_PRISMA_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../todo/adapter/inversify/containerModules/TodoPrismaContainerModule.js';

const PRISMA_CLIENT_IMPORT_PATH: string = '../../generated/prisma/client.js';

interface DbAdapterInitializeContainerFragments {
  imports: SourceImport[];
  initializeContainerBodyStatements: string[];
}

const DB_ADAPTER_INITIALIZE_CONTAINER_FRAGMENTS: Record<
  DbAdapter,
  DbAdapterInitializeContainerFragments
> = {
  [DbAdapter.prismaPostgresql]: {
    imports: [
      {
        moduleSpecifier: '@inversifyjs/prisma',
        namedImports: [{ name: 'PrismaContainerModule' }],
      },
      {
        moduleSpecifier: '@prisma/adapter-pg',
        namedImports: [{ name: 'PrismaPg' }],
      },
      {
        moduleSpecifier: PRISMA_CLIENT_IMPORT_PATH,
        namedImports: [{ name: 'PrismaClient' }],
      },
      {
        moduleSpecifier: TODO_CONTAINER_MODULE_IMPORT_PATH,
        namedImports: [{ name: 'TodoContainerModule' }],
      },
      {
        moduleSpecifier: TODO_PRISMA_CONTAINER_MODULE_IMPORT_PATH,
        namedImports: [{ name: 'TodoPrismaContainerModule' }],
      },
    ],
    initializeContainerBodyStatements: [
      'const { DATABASE_URL } = configService.get();',
      `container.load(
  new PrismaContainerModule({
    adapter: {
      build: (options: { connectionString: string }) => new PrismaPg(options),
    },
    options: {
      value: {
        connectionString: DATABASE_URL,
      },
    },
    PrismaClient,
  }),
);`,
      'container.load(new StatusContainerModule());',
      'container.load(new TodoContainerModule());',
      'container.load(new TodoPrismaContainerModule());',
    ],
  },
};

export function createInitializeContainerSourceModel(
  dbAdapter: DbAdapter = DEFAULT_DB_ADAPTER,
): InitializeContainerSourceModel {
  const dbAdapterFragments: DbAdapterInitializeContainerFragments =
    DB_ADAPTER_INITIALIZE_CONTAINER_FRAGMENTS[dbAdapter];

  return {
    imports: [
      {
        moduleSpecifier: 'inversify',
        namedImports: [{ name: 'Container' }],
      },
      {
        moduleSpecifier: LOGGER_CONTAINER_MODULE_IMPORT_PATH,
        namedImports: [{ name: 'LoggerContainerModule' }],
      },
      {
        moduleSpecifier: STATUS_CONTAINER_MODULE_IMPORT_PATH,
        namedImports: [{ name: 'StatusContainerModule' }],
      },
      ...dbAdapterFragments.imports,
    ],
    initializeContainerBodyStatements: [
      'const configService: ConfigService<AppConfig> = container.get(configServiceIdentifier);',
      'const { LOG_LEVELS } = configService.get();',
      'container.load(new LoggerContainerModule({ logTypes: LOG_LEVELS }));',
      ...dbAdapterFragments.initializeContainerBodyStatements,
    ],
  };
}
