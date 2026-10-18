import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { HttpInsightsEventSink } from '../services/HttpInsightsEventSink.js';

export class InstrumentationContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(HttpInsightsEventSink).toSelf().inSingletonScope();
    });
  }
}
