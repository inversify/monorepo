import { type MultipleInjectionResolvedValueElementMetadata } from '../models/MultipleInjectionResolvedValueElementMetadata.js';
import { ResolvedValueElementMetadataKind } from '../models/ResolvedValueElementMetadataKind.js';

export class MultipleInjectionResolvedValueElementMetadataFixtures {
  public static get any(): MultipleInjectionResolvedValueElementMetadata {
    return {
      chained: false,
      kind: ResolvedValueElementMetadataKind.multipleInjection,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: Symbol(),
    };
  }
}
