export interface PlanMetadataKey {
  readonly kind: 'number' | 'string' | 'symbol';
  readonly value: string;
}
