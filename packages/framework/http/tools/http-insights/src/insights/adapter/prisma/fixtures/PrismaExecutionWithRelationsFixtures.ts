import { type PrismaExecutionWithRelations } from '../builders/ExecutionFromPrismaExecutionBuilder.js';
import { PrismaControllerFixtures } from './PrismaControllerFixtures.js';
import { PrismaGuardFixtures } from './PrismaGuardFixtures.js';
import { PrismaHttpErrorFixtures } from './PrismaHttpErrorFixtures.js';
import { PrismaInterceptorFixtures } from './PrismaInterceptorFixtures.js';
import { PrismaMiddlewareFixtures } from './PrismaMiddlewareFixtures.js';
import { PrismaNativeMiddlewareFixtures } from './PrismaNativeMiddlewareFixtures.js';
import { PrismaPipeFixtures } from './PrismaPipeFixtures.js';
import { PrismaRequestFixtures } from './PrismaRequestFixtures.js';
import { PrismaResponseFixtures } from './PrismaResponseFixtures.js';

export class PrismaExecutionWithRelationsFixtures {
  public static get any(): PrismaExecutionWithRelations {
    return {
      controller: PrismaControllerFixtures.any,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      guards: [PrismaGuardFixtures.any],
      httpErrors: [PrismaHttpErrorFixtures.any],
      id: 'execution-id',
      interceptors: [PrismaInterceptorFixtures.any],
      middlewares: [PrismaMiddlewareFixtures.any],
      nativeMiddlewares: [PrismaNativeMiddlewareFixtures.any],
      pipes: [PrismaPipeFixtures.any],
      request: PrismaRequestFixtures.any,
      response: PrismaResponseFixtures.any,
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  public static get withNullController(): PrismaExecutionWithRelations {
    return {
      ...PrismaExecutionWithRelationsFixtures.any,
      controller: null,
    };
  }

  public static get withNullRequest(): PrismaExecutionWithRelations {
    return {
      ...PrismaExecutionWithRelationsFixtures.any,
      request: null,
    };
  }

  public static get withNullResponse(): PrismaExecutionWithRelations {
    return {
      ...PrismaExecutionWithRelationsFixtures.any,
      response: null,
    };
  }
}
