import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { GetPlanOptions } from './GetPlanOptions';
import { NonCachedServiceNodeContext } from './NonCachedServiceNodeContext';
import { PlanResult } from './PlanResult';
import { PlanServiceNode } from './PlanServiceNode';

export interface PlanParamsOperations {
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
}
