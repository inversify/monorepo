import { type ServiceIdentifier } from '@inversifyjs/common';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanBindingNode } from './PlanBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

const UNDEFINED_RESOLVE: (
  params: ResolutionParams,
) => unknown = (): undefined => undefined;

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
      this.resolve = value.resolve.bind(value);
    }
  }
}
