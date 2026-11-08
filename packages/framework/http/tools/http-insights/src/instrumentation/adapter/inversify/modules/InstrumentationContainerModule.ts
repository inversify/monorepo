import {
  type Container,
  ContainerModule,
  type ContainerModuleLoadOptions,
} from 'inversify';

import { type HttpInsightsProviderOptions } from '../../../../insights/adapter/inversify/models/HttpInsightsProviderOptions.js';
import { CallManagementInputPort } from '../../../../insights/application/ports/CallManagementInputPort.js';
import { ErrorTracesService } from '../../../../insights/application/services/ErrorTracesService.js';
import { HttpInsightsEventSink } from '../services/HttpInsightsEventSink.js';

export class InstrumentationContainerModule extends ContainerModule {
  constructor(
    container: Container,
    insightsOptions?: HttpInsightsProviderOptions,
  ) {
    super((options: ContainerModuleLoadOptions) => {
      options
        .bind(HttpInsightsEventSink)
        .toResolvedValue(
          (
            callManagementInputPort: CallManagementInputPort,
            errorTracesService: ErrorTracesService,
          ): HttpInsightsEventSink =>
            new HttpInsightsEventSink(
              callManagementInputPort,
              container,
              errorTracesService,
              insightsOptions,
            ),
          [CallManagementInputPort, ErrorTracesService],
        )
        .inSingletonScope();
    });
  }
}
