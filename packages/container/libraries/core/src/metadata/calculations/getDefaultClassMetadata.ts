import { ClassMetadata } from '../models/ClassMetadata';

export function getDefaultClassMetadata(): ClassMetadata {
  return {
    constructorArguments: [],
    lifecycle: {
      postConstructMethodNames: [],
      preDestroyMethodNames: [],
    },
    properties: new Map(),
    scope: undefined,
  };
}
