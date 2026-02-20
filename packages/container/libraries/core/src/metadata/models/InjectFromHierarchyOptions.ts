import { type InjectFromHierarchyOptionsLifecycle } from './InjectFromHierarchyOptionsLifecycle.js';

export interface InjectFromHierarchyOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromHierarchyOptionsLifecycle | undefined;
}
