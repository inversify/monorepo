import {
  isPromise,
  type Newable,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { resolveBindingServiceActivations } from '../../resolution/actions/resolveBindingServiceActivations.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import {
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeAsyncFromOnlyConstructorParams,
} from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

const ZERO_CONSTRUCTOR_ARGUMENTS: number = 0;
const ONE_CONSTRUCTOR_ARGUMENT: number = 1;
const TWO_CONSTRUCTOR_ARGUMENTS: number = 2;
const THREE_CONSTRUCTOR_ARGUMENTS: number = 3;
const FOUR_CONSTRUCTOR_ARGUMENTS: number = 4;

/*
 * Monotonically increasing id used to make every generated function's
 * source text unique (see buildZeroConstructorArgumentsResolveNode below).
 */
let nextGeneratedResolverId: number = 0;

/**
 * Builds a `resolveNode` for a zero-argument instance binding by generating
 * a brand new function via the `Function` constructor for every binding.
 *
 * This is not just an inlining trick: the `Function` constructor result is
 * cached by V8 keyed on the *exact source text* passed to it. If every
 * binding generated the exact same source text (e.g. always naming the
 * constructor parameter `ctor`), V8 would transparently reuse the very same
 * compiled function (and its feedback vector) for every binding sharing
 * this code path. Since that single shared `new ctor()` call site would
 * then observe a different class on every binding, its type feedback would
 * become polymorphic/megamorphic across all of them, defeating the purpose
 * of generating specialized code and forcing V8 back to the generic,
 * non-inlined construction path.
 *
 * Suffixing every identifier with a per-binding id keeps the source text
 * (and therefore the compiled function and its feedback) unique per
 * binding, so the `new ctor()` call site stays monomorphic and V8 can
 * inline/optimize it as if it had been hand-written for that one class.
 */
function buildZeroConstructorArgumentsResolveNode<TActivated>(
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = (nextGeneratedResolverId++).toString();

  const buildResolveNode: (
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
  ) => (params: ResolutionParams) => Resolved<TActivated> =
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(
      `ctor$${id}`,
      `activate$${id}`,
      `return function resolveNode$${id}(params$${id}) {
        return activate$${id}(params$${id}, new ctor$${id}());
      };`,
    ) as (
      implementationType: Newable<TActivated>,
      resolveActivations: (
        params: ResolutionParams,
        instance: SyncResolved<TActivated>,
      ) => Resolved<TActivated>,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(implementationType, resolveActivations);
}

/**
 * Same rationale as {@link buildZeroConstructorArgumentsResolveNode}, but
 * for one-argument instance bindings.
 */
function buildOneConstructorArgumentResolveNode<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = (nextGeneratedResolverId++).toString();

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromiseFunction: typeof isPromise,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `isPromise$${id}`,
    `return function resolveNode$${id}(params$${id}) {
        const resolvedValue$${id} = node$${id}.constructorParams[0].resolve(params$${id});

        if (isPromise$${id}(resolvedValue$${id})) {
          return resolvedValue$${id}.then(function (resolvedValue$${id}) {
            return activate$${id}(params$${id}, new ctor$${id}(resolvedValue$${id}));
          });
        }

        return activate$${id}(params$${id}, new ctor$${id}(resolvedValue$${id}));
      };`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromise: <TParam>(object: unknown) => object is Promise<TParam>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    isPromise,
  );
}

/**
 * Same rationale as {@link buildZeroConstructorArgumentsResolveNode}, but
 * for two-argument instance bindings.
 */
function buildTwoConstructorArgumentsResolveNode<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = (nextGeneratedResolverId++).toString();

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveTwoFunction: typeof resolveTwo,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `resolveTwo$${id}`,
    `return function resolveNode$${id}(params$${id}) {
        const firstResolvedValue$${id} = node$${id}.constructorParams[0].resolve(params$${id});
        const secondResolvedValue$${id} = node$${id}.constructorParams[1].resolve(params$${id});

        return resolveTwo$${id}(
          firstResolvedValue$${id},
          secondResolvedValue$${id},
          function (resolvedFirstValue$${id}, resolvedSecondValue$${id}) {
            return activate$${id}(
              params$${id},
              new ctor$${id}(resolvedFirstValue$${id}, resolvedSecondValue$${id}),
            );
          },
        );
      };`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveTwo: <TParam, TResult>(
      value1: Resolved<TParam>,
      value2: Resolved<TParam>,
      build: (value1: TParam, value2: TParam) => Resolved<TResult>,
    ) => Resolved<TResult>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    resolveTwo,
  );
}

/**
 * Same rationale as {@link buildZeroConstructorArgumentsResolveNode}, but
 * for three-argument instance bindings.
 */
function buildThreeConstructorArgumentsResolveNode<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = (nextGeneratedResolverId++).toString();

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveThreeFunction: typeof resolveThree,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `resolveThree$${id}`,
    `return function resolveNode$${id}(params$${id}) {
        const firstResolvedValue$${id} = node$${id}.constructorParams[0].resolve(params$${id});
        const secondResolvedValue$${id} = node$${id}.constructorParams[1].resolve(params$${id});
        const thirdResolvedValue$${id} = node$${id}.constructorParams[2].resolve(params$${id});

        return resolveThree$${id}(
          firstResolvedValue$${id},
          secondResolvedValue$${id},
          thirdResolvedValue$${id},
          function (
            resolvedFirstValue$${id},
            resolvedSecondValue$${id},
            resolvedThirdValue$${id},
          ) {
            return activate$${id}(
              params$${id},
              new ctor$${id}(
                resolvedFirstValue$${id},
                resolvedSecondValue$${id},
                resolvedThirdValue$${id},
              ),
            );
          },
        );
      };`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveThree: <TParam, TResult>(
      value1: Resolved<TParam>,
      value2: Resolved<TParam>,
      value3: Resolved<TParam>,
      build: (
        value1: TParam,
        value2: TParam,
        value3: TParam,
      ) => Resolved<TResult>,
    ) => Resolved<TResult>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    resolveThree,
  );
}

/**
 * Same rationale as {@link buildZeroConstructorArgumentsResolveNode}, but
 * for four-argument instance bindings.
 */
function buildFourConstructorArgumentsResolveNode<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = (nextGeneratedResolverId++).toString();

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveFourFunction: typeof resolveFour,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `resolveFour$${id}`,
    `return function resolveNode$${id}(params$${id}) {
        const firstResolvedValue$${id} = node$${id}.constructorParams[0].resolve(params$${id});
        const secondResolvedValue$${id} = node$${id}.constructorParams[1].resolve(params$${id});
        const thirdResolvedValue$${id} = node$${id}.constructorParams[2].resolve(params$${id});
        const fourthResolvedValue$${id} = node$${id}.constructorParams[3].resolve(params$${id});

        return resolveFour$${id}(
          firstResolvedValue$${id},
          secondResolvedValue$${id},
          thirdResolvedValue$${id},
          fourthResolvedValue$${id},
          function (
            resolvedFirstValue$${id},
            resolvedSecondValue$${id},
            resolvedThirdValue$${id},
            resolvedFourthValue$${id},
          ) {
            return activate$${id}(
              params$${id},
              new ctor$${id}(
                resolvedFirstValue$${id},
                resolvedSecondValue$${id},
                resolvedThirdValue$${id},
                resolvedFourthValue$${id},
              ),
            );
          },
        );
      };`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
    resolveFour: <TParam, TResult>(
      value1: Resolved<TParam>,
      value2: Resolved<TParam>,
      value3: Resolved<TParam>,
      value4: Resolved<TParam>,
      build: (
        value1: TParam,
        value2: TParam,
        value3: TParam,
        value4: TParam,
      ) => Resolved<TResult>,
    ) => Resolved<TResult>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    resolveFour,
  );
}

const resolveInstanceBindingNode: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any, any>(
  resolveInstanceBindingConstructorParams,
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeFromConstructorParams,
);

const resolveScopedInstanceBindingNode: <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.Instance,
    InstanceBinding<TActivated>,
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  >(node, resolveInstanceBindingNode);

/**
 * Builds a resolver for instance binding nodes with no properties to set,
 * no post construct methods and no binding activation.
 *
 * The resolution logic is inlined in a single closure to minimize function
 * call dispatch overhead: this is the hottest resolution path. Common small
 * constructor arities are specialized to avoid constructor values array
 * allocations and spread construct calls.
 */
function buildSimpleInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const implementationType: Newable<TActivated> =
    node.binding.implementationType;
  const serviceIdentifier: ServiceIdentifier<TActivated> =
    node.binding.serviceIdentifier;

  function resolveActivations(
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ): Resolved<TActivated> {
    if (params.getActivations(serviceIdentifier) === undefined) {
      return instance;
    }

    return resolveBindingServiceActivations<TActivated>(
      params,
      serviceIdentifier,
      instance,
    );
  }

  let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

  switch (node.classMetadata.constructorArguments.length) {
    case ZERO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildZeroConstructorArgumentsResolveNode(
        implementationType,
        resolveActivations,
      );
      break;
    case ONE_CONSTRUCTOR_ARGUMENT:
      resolveNode = buildOneConstructorArgumentResolveNode(
        node,
        implementationType,
        resolveActivations,
      );
      break;
    case TWO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildTwoConstructorArgumentsResolveNode(
        node,
        implementationType,
        resolveActivations,
      );
      break;
    case THREE_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildThreeConstructorArgumentsResolveNode(
        node,
        implementationType,
        resolveActivations,
      );
      break;
    case FOUR_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildFourConstructorArgumentsResolveNode(
        node,
        implementationType,
        resolveActivations,
      );
      break;
    default:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const constructorValues: unknown[] | Promise<unknown[]> =
          resolveInstanceBindingConstructorParams(params, node);

        if (isPromise(constructorValues)) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            constructorValues,
            params,
            node,
          );
        }

        return resolveActivations(
          params,
          new implementationType(...constructorValues),
        );
      };
  }

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}

export function buildInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (
    node.classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
    node.binding.onActivation === undefined &&
    node.classMetadata.properties.size === 0
  ) {
    return buildSimpleInstanceBindingNodeResolver(node);
  }

  return resolveScopedInstanceBindingNode(node);
}
