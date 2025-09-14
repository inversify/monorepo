import { ClassMetadata } from '../models/ClassMetadata';

export function getDefaultClassMetadata(): ClassMetadata {
  return {
    constructorArguments: [],
    lifecycle: {
      postConstructMethodNames: new Set(),
      preDestroyMethodNames: new Set(),
    },
    properties: new Map(),
    scope: undefined,
  };
}
