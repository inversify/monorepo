import { MultipleInjectionResolvedValueElementMetadata } from '../models/MultipleInjectionResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../models/ResolvedValueElementMetadataKind';

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
