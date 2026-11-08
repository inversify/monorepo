import { type PlanProperty } from './PlanProperty.js';
import { type PlanService } from './PlanService.js';
import { type PlanServiceIdentifier } from './PlanServiceIdentifier.js';

export type PlanBindingType =
  | 'ConstantValue'
  | 'DynamicValue'
  | 'Factory'
  | 'Instance'
  | 'ResolvedValue'
  | 'ServiceRedirection';

export const planBindingTypeValues: {
  [TKey in PlanBindingType]: TKey;
} = {
  ConstantValue: 'ConstantValue',
  DynamicValue: 'DynamicValue',
  Factory: 'Factory',
  Instance: 'Instance',
  ResolvedValue: 'ResolvedValue',
  ServiceRedirection: 'ServiceRedirection',
};

export type PlanBindingScope = 'Request' | 'Singleton' | 'Transient';

export const planBindingScopeValues: {
  [TKey in PlanBindingScope]: TKey;
} = {
  Request: 'Request',
  Singleton: 'Singleton',
  Transient: 'Transient',
};

export interface BasePlanBinding<TType extends PlanBindingType> {
  readonly id: string;
  readonly bindingId: number;
  readonly moduleId: number | null;
  readonly serviceIdentifier: PlanServiceIdentifier;
  readonly type: TType;
}

export interface ScopedPlanBinding<
  TType extends PlanBindingType,
  TScope extends PlanBindingScope = PlanBindingScope,
> extends BasePlanBinding<TType> {
  readonly scope: TScope;
}

export type ConstantValuePlanBinding = ScopedPlanBinding<
  typeof planBindingTypeValues.ConstantValue,
  typeof planBindingScopeValues.Singleton
>;

export type DynamicValuePlanBinding = ScopedPlanBinding<
  typeof planBindingTypeValues.DynamicValue
>;

export type FactoryPlanBinding = ScopedPlanBinding<
  typeof planBindingTypeValues.Factory,
  typeof planBindingScopeValues.Singleton
>;

export interface InstancePlanBinding extends ScopedPlanBinding<
  typeof planBindingTypeValues.Instance
> {
  readonly constructorArguments: readonly (PlanService | null)[];
  readonly implementationType: PlanServiceIdentifier;
  readonly properties: readonly PlanProperty[];
}

export interface ResolvedValuePlanBinding extends ScopedPlanBinding<
  typeof planBindingTypeValues.ResolvedValue
> {
  readonly arguments: readonly PlanService[];
}

export interface ServiceRedirectionPlanBinding extends BasePlanBinding<
  typeof planBindingTypeValues.ServiceRedirection
> {
  readonly redirection: PlanService;
  readonly targetServiceIdentifier: PlanServiceIdentifier;
}

export type PlanBinding =
  | ConstantValuePlanBinding
  | DynamicValuePlanBinding
  | FactoryPlanBinding
  | InstancePlanBinding
  | ResolvedValuePlanBinding
  | ServiceRedirectionPlanBinding;
