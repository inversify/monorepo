import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';

import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { type Binding } from '../../binding/models/Binding.js';
import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type GetPlanOptions } from './GetPlanOptions.js';
import { type NonCachedServiceNodeContext } from './NonCachedServiceNodeContext.js';
import { type PlanResult } from './PlanResult.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export interface PlanParamsOperations {
  readonly getActivations: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingActivation<TActivated>> | undefined;
  getBindings: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Iterable<Binding<TInstance>> | undefined;
  getBindingsChained: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Generator<Binding<TInstance>, void, unknown>;
  readonly getClassMetadata: (type: Newable) => ClassMetadata;
  readonly getPlan: (options: GetPlanOptions) => PlanResult | undefined;
  setBinding: <TInstance>(binding: Binding<TInstance>) => void;
  readonly setNonCachedServiceNode: (
    node: PlanServiceNode,
    context: NonCachedServiceNodeContext,
  ) => void;
  readonly setPlan: (options: GetPlanOptions, planResult: PlanResult) => void;
  readonly subscribeActivationAddedOnce: (
    serviceIdentifier: ServiceIdentifier,
    subscriber: ActivationSubscriber,
  ) => void;
}
