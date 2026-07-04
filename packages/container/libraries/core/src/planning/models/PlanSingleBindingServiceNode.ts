import { type ServiceIdentifier } from '@inversifyjs/common';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanBindingNode } from './PlanBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

const UNDEFINED_RESOLVE: (
  params: ResolutionParams,
) => unknown = (): undefined => undefined;

const RESOLVE_KEY: keyof PlanServiceNode = 'resolve';

export class PlanSingleBindingServiceNodeImplementation implements PlanServiceNode {
  public isContextFree: boolean;
  public resolve: (params: ResolutionParams) => unknown;

  #binding: PlanBindingNode | undefined;

  constructor(public readonly serviceIdentifier: ServiceIdentifier) {
    this.isContextFree = true;

    this.resolve = UNDEFINED_RESOLVE;
  }

  public get bindings(): PlanBindingNode | undefined {
    return this.#binding;
  }

  public set bindings(value: PlanBindingNode | undefined) {
    this.#binding = value;

    if (value === undefined) {
      this.resolve = UNDEFINED_RESOLVE;
    } else {
      /*
       * Binding nodes exposing an own `resolve` property provide `this`
       * independent closures. Reusing them avoids a bound function trampoline
       * in the resolution hot path. Prototype `resolve` methods rely on
       * `this`, so they are bound to the binding node instead.
       */
      this.resolve = Object.hasOwn(value, RESOLVE_KEY)
        ? value.resolve
        : value.resolve.bind(value);
    }
  }
}
