import { type BaseRouterNodeMatch } from './BaseRouterNodeMatch.js';
import { type RouterNodeMatchKind } from './RouterNodeMatchKind.js';

export interface RouterNodeLiteralMatch extends BaseRouterNodeMatch<RouterNodeMatchKind.literal> {
  readonly route: string;
}
