import { type PrismaCallWithRelations } from '../builders/CallFromPrismaCallBuilder.js';
import { PrismaControllerFixtures } from './PrismaControllerFixtures.js';
import { PrismaGuardFixtures } from './PrismaGuardFixtures.js';
import { PrismaHttpErrorFixtures } from './PrismaHttpErrorFixtures.js';
import { PrismaInterceptorFixtures } from './PrismaInterceptorFixtures.js';
import { PrismaMiddlewareFixtures } from './PrismaMiddlewareFixtures.js';
import { PrismaNativeMiddlewareFixtures } from './PrismaNativeMiddlewareFixtures.js';
import { PrismaPipeFixtures } from './PrismaPipeFixtures.js';
import { PrismaRequestFixtures } from './PrismaRequestFixtures.js';
import { PrismaResponseFixtures } from './PrismaResponseFixtures.js';

export class PrismaCallWithRelationsFixtures {
  public static get any(): PrismaCallWithRelations {
    return {
      controller: PrismaControllerFixtures.any,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      guards: [PrismaGuardFixtures.any],
      httpErrors: [PrismaHttpErrorFixtures.any],
      id: 'call-id',
      interceptors: [PrismaInterceptorFixtures.any],
      middlewares: [PrismaMiddlewareFixtures.any],
      nativeMiddlewares: [PrismaNativeMiddlewareFixtures.any],
      pipes: [PrismaPipeFixtures.any],
      request: PrismaRequestFixtures.any,
      response: PrismaResponseFixtures.any,
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  public static get withNullController(): PrismaCallWithRelations {
    return {
      ...PrismaCallWithRelationsFixtures.any,
      controller: null,
    };
  }

  public static get withNullRequest(): PrismaCallWithRelations {
    return {
      ...PrismaCallWithRelationsFixtures.any,
      request: null,
    };
  }

  public static get withNullResponse(): PrismaCallWithRelations {
    return {
      ...PrismaCallWithRelationsFixtures.any,
      response: null,
    };
  }
}
