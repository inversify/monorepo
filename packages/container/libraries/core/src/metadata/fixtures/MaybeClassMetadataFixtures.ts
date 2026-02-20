import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export class MaybeClassMetadataFixtures {
  public static get any(): MaybeClassMetadata {
    const fixture: MaybeClassMetadata = {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties: new Map(),
      scope: undefined,
    };

    return fixture;
  }
}
