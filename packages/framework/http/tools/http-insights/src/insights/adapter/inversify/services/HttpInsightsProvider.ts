import {
  type EventSink,
  type HttpInstrumentationEvent,
} from '@inversifyjs/http-instrumentation-core';
import { type Container } from 'inversify';

import { DbContainerModule } from '../../../../foundation/db/adapter/inversify/modules/DbContainerModule.js';
import { InstrumentationContainerModule } from '../../../../instrumentation/adapter/inversify/modules/InstrumentationContainerModule.js';
import { HttpInsightsEventSink } from '../../../../instrumentation/adapter/inversify/services/HttpInsightsEventSink.js';
import { type HttpInsightsProviderOptions } from '../models/HttpInsightsProviderOptions.js';
import { InsightsContainerModule } from '../modules/InsightsContainerModule.js';

export class HttpInsightsProvider {
  #provided: boolean;
  #eventSink: EventSink<HttpInstrumentationEvent> | undefined;
  readonly #options: HttpInsightsProviderOptions | undefined;

  constructor(options?: HttpInsightsProviderOptions) {
    this.#provided = false;
    this.#eventSink = undefined;
    this.#options = options;
  }

  public async provide(container: Container): Promise<void> {
    if (this.#provided) {
      throw new Error('Cannot provide insights more than once');
    }

    await container.loadAsync(
      new DbContainerModule(),
      new InsightsContainerModule(),
      new InstrumentationContainerModule(this.#options),
    );

    this.#eventSink = container.get(HttpInsightsEventSink);
    this.#provided = true;
  }

  public getEventSink(): EventSink<HttpInstrumentationEvent> {
    if (this.#eventSink === undefined) {
      throw new Error('Cannot get event sink before providing insights');
    }

    return this.#eventSink;
  }
}
