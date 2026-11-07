import { type ConstantValueBindingInspection } from './ConstantValueBindingInspection.js';
import { type DynamicValueBindingInspection } from './DynamicValueBindingInspection.js';
import { type FactoryBindingInspection } from './FactoryBindingInspection.js';
import { type InstanceBindingInspection } from './InstanceBindingInspection.js';
import { type ResolvedValueBindingInspection } from './ResolvedValueBindingInspection.js';
import { type ServiceRedirectionBindingInspection } from './ServiceRedirectionBindingInspection.js';

export type PlanBindingInspection =
  | ConstantValueBindingInspection
  | DynamicValueBindingInspection
  | FactoryBindingInspection
  | InstanceBindingInspection
  | ResolvedValueBindingInspection
  | ServiceRedirectionBindingInspection;
