import { BaseResolvedValueElementMetadata } from './BaseResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from './ResolvedValueElementMetadataKind';

export interface MultipleInjectionResolvedValueElementMetadata extends BaseResolvedValueElementMetadata<ResolvedValueElementMetadataKind.multipleInjection> {
  chained: boolean;
}
