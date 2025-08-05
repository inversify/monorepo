import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MultipleInjectionManagedClassElementMetadata } from '../models/MultipleInjectionManagedClassElementMetadata';

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
