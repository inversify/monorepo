import { ResolvedValueElementMetadataKind } from '../models/ResolvedValueElementMetadataKind';
import { SingleInjectionResolvedValueElementMetadata } from '../models/SingleInjectionResolvedValueElementMetadata';

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
