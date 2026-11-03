import {
  type GetPlanOptions,
  LazyPlanServiceNode,
  type PlanResult,
  type PlanServiceNode,
} from '@inversifyjs/core';
import { Plugin, type PluginApi } from '@inversifyjs/plugin';
import * as inversify from 'inversify';

import {
  clone,
  type CustomCloneableHandlerTuple,
} from './clone/calculations/clone';
import { type Cloneable } from './clone/models/Cloneable';

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
        // We really don't care about resolve here, the node is used to generate a graph
        // oxlint-disable-next-line typescript/unbound-method
        resolve: input.resolve,
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
