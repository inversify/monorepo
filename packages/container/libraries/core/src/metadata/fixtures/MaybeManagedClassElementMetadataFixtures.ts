import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';

export class MaybeManagedClassElementMetadataFixtures {
  public static get any(): MaybeManagedClassElementMetadata {
    return {
      kind: MaybeClassElementMetadataKind.unknown,
      name: undefined,
      optional: false,
      tags: new Map(),
    };
  }
}
