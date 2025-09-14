import { bindingScopeValues, ClassMetadata } from '@inversifyjs/core';

export class ClassMetadataFixtures {
  public static get any(): ClassMetadata {
    const fixture: ClassMetadata = {
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

  public static get withScopeRequest(): ClassMetadata {
    const fixture: ClassMetadata = {
      ...ClassMetadataFixtures.any,
      scope: bindingScopeValues.Request,
    };

    return fixture;
  }

  public static get withScopeUndefined(): ClassMetadata {
    const fixture: ClassMetadata = {
      ...ClassMetadataFixtures.any,
      scope: undefined,
    };

    return fixture;
  }
}
