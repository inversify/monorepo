export interface PlanServiceIdentifier {
  readonly kind: 'class' | 'string' | 'symbol';
  readonly value: string;
}
