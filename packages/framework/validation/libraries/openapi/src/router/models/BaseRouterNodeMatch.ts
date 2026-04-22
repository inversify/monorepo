import { type RouterNodeMatchKind } from './RouterNodeMatchKind.js';

export interface BaseRouterNodeMatch<TKind extends RouterNodeMatchKind> {
  readonly kind: TKind;
}
