import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { SingleInjectionManagedClassElementMetadata } from '../models/SingleInjectionManagedClassElementMetadata';

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
