import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { InsightsManagementInputPort } from '../../../application/ports/InsightsManagementInputPort.js';
import { insightsPersistenceOutputPortService } from '../../../application/ports/InsightsPersistenceOutputPort.js';
import { PrismaInsightsPersistenceAdapter } from '../../prisma/adapters/PrismaInsightsPersistenceAdapter.js';
import { ControllerFromPrismaControllerBuilder } from '../../prisma/builders/ControllerFromPrismaControllerBuilder.js';
import { ExecutionFromPrismaExecutionBuilder } from '../../prisma/builders/ExecutionFromPrismaExecutionBuilder.js';
import { GuardFromPrismaGuardBuilder } from '../../prisma/builders/GuardFromPrismaGuardBuilder.js';
import { HttpErrorFromPrismaHttpErrorBuilder } from '../../prisma/builders/HttpErrorFromPrismaHttpErrorBuilder.js';
import { InterceptorFromPrismaInterceptorBuilder } from '../../prisma/builders/InterceptorFromPrismaInterceptorBuilder.js';
import { MiddlewareFromPrismaMiddlewareBuilder } from '../../prisma/builders/MiddlewareFromPrismaMiddlewareBuilder.js';
import { NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from '../../prisma/builders/NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';
import { PipeFromPrismaPipeBuilder } from '../../prisma/builders/PipeFromPrismaPipeBuilder.js';
import { RequestFromPrismaRequestBuilder } from '../../prisma/builders/RequestFromPrismaRequestBuilder.js';
import { ResponseFromPrismaResponseBuilder } from '../../prisma/builders/ResponseFromPrismaResponseBuilder.js';
import { InsightsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/InsightsFindQueryFromGetInsightsV1QueryBuilder.js';
import { InsightsController } from '../controllers/InsightsController.js';

export class InsightsContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(InsightsController).toSelf().inSingletonScope();
      options
        .bind(InsightsFindQueryFromGetInsightsV1QueryBuilder)
        .toSelf()
        .inSingletonScope();
      options.bind(InsightsManagementInputPort).toSelf().inSingletonScope();
      options
        .bind(insightsPersistenceOutputPortService)
        .to(PrismaInsightsPersistenceAdapter)
        .inSingletonScope();
      options
        .bind(ControllerFromPrismaControllerBuilder)
        .toSelf()
        .inSingletonScope();
      options
        .bind(ExecutionFromPrismaExecutionBuilder)
        .toSelf()
        .inSingletonScope();
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
