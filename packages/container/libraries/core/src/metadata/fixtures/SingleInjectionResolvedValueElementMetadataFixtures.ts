import { ResolvedValueElementMetadataKind } from '../models/ResolvedValueElementMetadataKind.js';
import { type SingleInjectionResolvedValueElementMetadata } from '../models/SingleInjectionResolvedValueElementMetadata.js';

export class SingleInjectionResolvedValueElementMetadataFixtures {
  public static get any(): SingleInjectionResolvedValueElementMetadata {
    return {
      kind: ResolvedValueElementMetadataKind.singleInjection,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: Symbol(),
    };
  }
}
