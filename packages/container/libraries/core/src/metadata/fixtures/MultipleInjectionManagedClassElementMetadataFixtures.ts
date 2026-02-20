import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type MultipleInjectionManagedClassElementMetadata } from '../models/MultipleInjectionManagedClassElementMetadata.js';

export class MultipleInjectionManagedClassElementMetadataFixtures {
  public static get any(): MultipleInjectionManagedClassElementMetadata {
    return {
      chained: false,
      kind: ClassElementMetadataKind.multipleInjection,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: Symbol(),
    };
  }
}
