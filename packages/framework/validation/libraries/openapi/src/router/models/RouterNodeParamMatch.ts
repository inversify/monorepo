import { type BaseRouterNodeMatch } from './BaseRouterNodeMatch.js';
import { type RouterNodeMatchKind } from './RouterNodeMatchKind.js';

export interface RouterNodeParamMatch extends BaseRouterNodeMatch<RouterNodeMatchKind.param> {
  readonly routes: RouterNodeParamMatchRoute[];
}

export interface RouterNodeParamMatchRoute {
  readonly constraints: [number, RegExp][];
  readonly route: string;
}
