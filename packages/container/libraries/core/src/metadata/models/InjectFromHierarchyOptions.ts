import { InjectFromHierarchyOptionsLifecycle } from './InjectFromHierarchyOptionsLifecycle';

export interface InjectFromHierarchyOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromHierarchyOptionsLifecycle | undefined;
}
