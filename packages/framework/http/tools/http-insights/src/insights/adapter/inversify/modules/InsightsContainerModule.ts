import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { CallManagementInputPort } from '../../../application/ports/CallManagementInputPort.js';
import { callPersistenceOutputPortService } from '../../../application/ports/CallPersistenceOutputPort.js';
import { PrismaInsightsPersistenceAdapter } from '../../prisma/adapters/PrismaInsightsPersistenceAdapter.js';
import { CallFromPrismaCallBuilder } from '../../prisma/builders/CallFromPrismaCallBuilder.js';
import { ControllerFromPrismaControllerBuilder } from '../../prisma/builders/ControllerFromPrismaControllerBuilder.js';
import { GuardFromPrismaGuardBuilder } from '../../prisma/builders/GuardFromPrismaGuardBuilder.js';
import { HttpErrorFromPrismaHttpErrorBuilder } from '../../prisma/builders/HttpErrorFromPrismaHttpErrorBuilder.js';
import { InterceptorFromPrismaInterceptorBuilder } from '../../prisma/builders/InterceptorFromPrismaInterceptorBuilder.js';
import { MiddlewareFromPrismaMiddlewareBuilder } from '../../prisma/builders/MiddlewareFromPrismaMiddlewareBuilder.js';
import { NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from '../../prisma/builders/NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';
import { PipeFromPrismaPipeBuilder } from '../../prisma/builders/PipeFromPrismaPipeBuilder.js';
import { RequestFromPrismaRequestBuilder } from '../../prisma/builders/RequestFromPrismaRequestBuilder.js';
import { ResponseFromPrismaResponseBuilder } from '../../prisma/builders/ResponseFromPrismaResponseBuilder.js';
import { CallsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/CallsFindQueryFromGetInsightsV1QueryBuilder.js';
import { CallsFindQueryFromCallIdBuilder } from '../builders/CallsFindQueryFromCallIdBuilder.js';
import { CallsController } from '../controllers/CallsController.js';
import { InsightsUiController } from '../controllers/InsightsUiController.js';

export class InsightsContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(CallsController).toSelf().inSingletonScope();
      options.bind(InsightsUiController).toSelf().inSingletonScope();
      options
        .bind(CallsFindQueryFromGetInsightsV1QueryBuilder)
        .toSelf()
        .inSingletonScope();
      options.bind(CallsFindQueryFromCallIdBuilder).toSelf().inSingletonScope();
      options.bind(CallManagementInputPort).toSelf().inSingletonScope();
      options
        .bind(callPersistenceOutputPortService)
        .to(PrismaInsightsPersistenceAdapter)
        .inSingletonScope();
      options
        .bind(ControllerFromPrismaControllerBuilder)
        .toSelf()
        .inSingletonScope();
      options.bind(CallFromPrismaCallBuilder).toSelf().inSingletonScope();
      options.bind(GuardFromPrismaGuardBuilder).toSelf().inSingletonScope();
      options
        .bind(HttpErrorFromPrismaHttpErrorBuilder)
        .toSelf()
        .inSingletonScope();
      options
        .bind(InterceptorFromPrismaInterceptorBuilder)
        .toSelf()
        .inSingletonScope();
      options
        .bind(MiddlewareFromPrismaMiddlewareBuilder)
        .toSelf()
        .inSingletonScope();
      options
        .bind(NativeMiddlewareFromPrismaNativeMiddlewareBuilder)
        .toSelf()
        .inSingletonScope();
      options.bind(PipeFromPrismaPipeBuilder).toSelf().inSingletonScope();
      options.bind(RequestFromPrismaRequestBuilder).toSelf().inSingletonScope();
      options
        .bind(ResponseFromPrismaResponseBuilder)
        .toSelf()
        .inSingletonScope();
    });
  }
}
