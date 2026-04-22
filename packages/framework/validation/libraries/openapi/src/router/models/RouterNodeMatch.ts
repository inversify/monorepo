import { type RouterNodeLiteralMatch } from './RouterNodeLiteralMatch.js';
import { type RouterNodeParamMatch } from './RouterNodeParamMatch.js';

export type RouterNodeMatch = RouterNodeLiteralMatch | RouterNodeParamMatch;
