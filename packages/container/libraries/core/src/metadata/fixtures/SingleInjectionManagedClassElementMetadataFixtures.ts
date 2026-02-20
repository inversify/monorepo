import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type SingleInjectionManagedClassElementMetadata } from '../models/SingleInjectionManagedClassElementMetadata.js';

export class SingleInjectionManagedClassElementMetadataFixtures {
  public static get any(): SingleInjectionManagedClassElementMetadata {
    return {
      kind: ClassElementMetadataKind.singleInjection,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: Symbol(),
    };
  }
}
