import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';

export class ClassMetadataFixtures {
  public static get any(): ClassMetadata {
    const fixture: ClassMetadata = {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodName: undefined,
        preDestroyMethodName: undefined,
      },
      properties: new Map(),
      scope: undefined,
    };

    return fixture;
  }

  public static get withUnmanagedConstructorArguments(): ClassMetadata {
    const fixture: ClassMetadata = {
      ...ClassMetadataFixtures.any,
      constructorArguments: [
        {
          kind: ClassElementMetadataKind.unmanaged,
        },
      ],
    };

    return fixture;
  }

  public static get withSingleInjectionConstructorArguments(): ClassMetadata {
    const fixture: ClassMetadata = {
      ...ClassMetadataFixtures.any,
      constructorArguments: [
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: Symbol(),
        },
      ],
    };

    return fixture;
  }

  public static get withNoPreDestroyMethodName(): ClassMetadata {
    const fixture: ClassMetadata = {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodName: undefined,
        preDestroyMethodName: undefined,
      },
      properties: new Map(),
      scope: undefined,
    };

    return fixture;
  }

  public static get withPreDestroyMethodName(): ClassMetadata {
    const fixture: ClassMetadata = {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodName: undefined,
        preDestroyMethodName: 'preDestroy',
      },
      properties: new Map(),
      scope: undefined,
    };

    return fixture;
  }
}
