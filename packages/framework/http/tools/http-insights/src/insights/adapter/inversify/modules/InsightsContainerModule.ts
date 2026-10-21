import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { ExecutionManagementInputPort } from '../../../application/ports/ExecutionManagementInputPort.js';
import { executionPersistenceOutputPortService } from '../../../application/ports/ExecutionPersistenceOutputPort.js';
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
import { ExecutionsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/ExecutionsFindQueryFromGetInsightsV1QueryBuilder.js';
import { ExecutionsFindQueryFromInsightsIdBuilder } from '../builders/ExecutionsFindQueryFromInsightsIdBuilder.js';
import { ExecutionController } from '../controllers/ExecutionController.js';
import { InsightsUiController } from '../controllers/InsightsUiController.js';

export class InsightsContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(ExecutionController).toSelf().inSingletonScope();
      options.bind(InsightsUiController).toSelf().inSingletonScope();
      options
        .bind(ExecutionsFindQueryFromGetInsightsV1QueryBuilder)
        .toSelf()
        .inSingletonScope();
      options
        .bind(ExecutionsFindQueryFromInsightsIdBuilder)
        .toSelf()
        .inSingletonScope();
      options.bind(ExecutionManagementInputPort).toSelf().inSingletonScope();
      options
        .bind(executionPersistenceOutputPortService)
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
