import { type BaseResolvedValueElementMetadata } from './BaseResolvedValueElementMetadata.js';
import { type ResolvedValueElementMetadataKind } from './ResolvedValueElementMetadataKind.js';

export interface MultipleInjectionResolvedValueElementMetadata extends BaseResolvedValueElementMetadata<ResolvedValueElementMetadataKind.multipleInjection> {
  chained: boolean;
}
