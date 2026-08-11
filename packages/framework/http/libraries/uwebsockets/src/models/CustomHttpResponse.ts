import { type HttpResponse } from 'uWebSockets.js';

import { type abortedSymbol } from '../data/abortedSymbol.js';
import { type routePathSymbol } from '../data/routePathSymbol.js';

export interface CustomHttpResponse extends HttpResponse {
  [abortedSymbol]?: boolean;
  [routePathSymbol]?: string;
}
