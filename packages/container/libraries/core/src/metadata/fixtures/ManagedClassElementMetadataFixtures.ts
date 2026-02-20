import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';

export class ManagedClassElementMetadataFixtures {
  public static get any(): ManagedClassElementMetadata {
    return {
      kind: ClassElementMetadataKind.singleInjection,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: Symbol(),
    };
  }

  public static get withIsFromTypescriptParamTypeTrue(): ManagedClassElementMetadata {
    return {
      ...ManagedClassElementMetadataFixtures.any,
      isFromTypescriptParamType: true,
    };
  }

  public static get withNoIsFromTypescriptParamType(): ManagedClassElementMetadata {
    const fixture: ManagedClassElementMetadata =
      ManagedClassElementMetadataFixtures.any;

    delete fixture.isFromTypescriptParamType;

    return fixture;
  }
}
