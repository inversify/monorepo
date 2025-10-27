import { GetPlanOptions, PlanResult } from '@inversifyjs/core';
import { Plugin, PluginApi } from '@inversifyjs/plugin';
import * as inversify from 'inversify';

class InversifyReactCodeRunnerPlugin extends Plugin<inversify.Container> {
  public load(api: PluginApi): void {
    api.onPlan((options: GetPlanOptions, result: PlanResult) => {
      self.postMessage({
        kind: 'plan',
        options: JSON.parse(JSON.stringify(options)) as GetPlanOptions,
        result: JSON.parse(JSON.stringify(result)) as PlanResult,
      });
    });
  }
}

class BundleContainer extends inversify.Container {
  constructor() {
    super();

    this.register(InversifyReactCodeRunnerPlugin);
  }
}

export * from 'inversify';

export { BundleContainer as Container };
