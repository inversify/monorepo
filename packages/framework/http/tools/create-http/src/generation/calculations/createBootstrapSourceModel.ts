import { DbAdapter, DEFAULT_DB_ADAPTER } from '../../models/DbAdapter.js';
import { type HttpAdapter } from '../../models/HttpAdapter.js';
import {
  type BootstrapSourceModel,
  type SourceImport,
} from '../models/BootstrapSourceModel.js';
import {
  HTTP_ADAPTER_BOOTSTRAP_SPECS,
  type HttpAdapterBootstrapSpec,
} from '../models/HttpAdapterBootstrapSpecs.js';

const LOGGER_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../logger/containerModules/LoggerContainerModule.js';

const STATUS_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../status/containerModules/StatusContainerModule.js';

const TODO_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../todo/adapter/inversify/TodoContainerModule.js';

const TODO_PRISMA_CONTAINER_MODULE_IMPORT_PATH: string =
  '../../todo/adapter/inversify/TodoPrismaContainerModule.js';

const PRISMA_CLIENT_IMPORT_PATH: string = '../../generated/prisma/client.js';

interface DbAdapterBootstrapFragments {
  imports: SourceImport[];
  initializeContainerBodyStatements: string[];
}

const DB_ADAPTER_BOOTSTRAP_FRAGMENTS: Record<
  DbAdapter,
  DbAdapterBootstrapFragments
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

export function createBootstrapSourceModel(
  httpAdapter: HttpAdapter,
  dbAdapter: DbAdapter = DEFAULT_DB_ADAPTER,
): BootstrapSourceModel {
  const bootstrapSpec: HttpAdapterBootstrapSpec =
    HTTP_ADAPTER_BOOTSTRAP_SPECS[httpAdapter];
  const dbAdapterFragments: DbAdapterBootstrapFragments =
    DB_ADAPTER_BOOTSTRAP_FRAGMENTS[dbAdapter];

  return {
    adapter: {
      className: bootstrapSpec.adapterClassName,
      optionsObjectLiteral: bootstrapSpec.adapterOptionsObjectLiteral,
    },
    ...(bootstrapSpec.applicationType === undefined
      ? {}
      : { applicationType: bootstrapSpec.applicationType }),
    imports: [
      {
        moduleSpecifier: bootstrapSpec.adapterModuleSpecifier,
        namedImports: [{ name: bootstrapSpec.adapterClassName }],
      },
      ...(bootstrapSpec.extraImports ?? []),
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
    listenStatements: bootstrapSpec.listenStatements,
  };
}
