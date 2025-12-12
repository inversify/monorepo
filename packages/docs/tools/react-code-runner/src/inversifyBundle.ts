import {
  GetPlanOptions,
  LazyPlanServiceNode,
  PlanResult,
  PlanServiceNode,
} from '@inversifyjs/core';
import { Plugin, PluginApi } from '@inversifyjs/plugin';
import * as inversify from 'inversify';

import { clone, CustomCloneableHandlerTuple } from './clone/calculations/clone';
import { Cloneable } from './clone/models/Cloneable';

const customHandlerTuples: CustomCloneableHandlerTuple[] = [
  [
    (input: unknown): input is LazyPlanServiceNode =>
      LazyPlanServiceNode.is(input),
    (
      input: LazyPlanServiceNode,
      clone: <T>(input: T) => Cloneable<T>,
    ): Cloneable<PlanServiceNode> =>
      clone({
        bindings: input.bindings,
        isContextFree: input.isContextFree,
        serviceIdentifier: input.serviceIdentifier,
      }),
  ],
];

const curriedClone: <T>(input: T) => Cloneable<T> = clone(customHandlerTuples);

class InversifyReactCodeRunnerPlugin extends Plugin<inversify.Container> {
  public load(api: PluginApi): void {
    api.onPlan((options: GetPlanOptions, result: PlanResult) => {
      self.postMessage({
        kind: 'plan',
        options: curriedClone(options),
        result: curriedClone(result),
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
