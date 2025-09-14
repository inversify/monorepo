import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

export class MaybeClassMetadataFixtures {
  public static get any(): MaybeClassMetadata {
    const fixture: MaybeClassMetadata = {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodNames: [],
        preDestroyMethodNames: [],
      },
      properties: new Map(),
      scope: undefined,
    };

    return fixture;
  }
}
