import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanBindingNode } from './PlanBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from './PlanServiceRedirectionBindingNode.js';

export class PlanServiceRedirectionBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
> implements PlanServiceRedirectionBindingNode<
  TActivated,
  ServiceRedirectionBinding<TActivated>
> {
  #redirection: PlanServiceNode | undefined;
  #resolve:
    | ((
        params: ResolutionParams,
      ) => Resolved<TActivated | TActivated[] | undefined>)
    | undefined;

  constructor(public readonly binding: ServiceRedirectionBinding<TActivated>) {
    this.#redirection = undefined;
    this.#resolve = undefined;
  }

  public get redirection(): PlanServiceNode {
    return this.#redirection as PlanServiceNode;
  }

  public set redirection(value: PlanServiceNode) {
    this.#redirection = value;

    if (value.bindings === undefined) {
      this.#resolve = (): Resolved<undefined> => undefined;
    } else {
      if (Array.isArray(value.bindings)) {
        this.#resolve = (): never => {
          throw new InversifyCoreError(
            InversifyCoreErrorKind.planning,
            'Unexpected resolver call for multiple bindings redirection',
          );
        };
      } else {
        const bindingNode: PlanBindingNode = value.bindings;

        this.#resolve = (params: ResolutionParams): Resolved<TActivated> =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          bindingNode.resolve(params);
      }
    }
  }

  public resolve(params: ResolutionParams): Resolved<TActivated> {
    return (
      this.#resolve as (params: ResolutionParams) => Resolved<TActivated>
    )(params);
  }
}
