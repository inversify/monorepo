import { type HttpResponse } from 'uWebSockets.js';

import { type abortedSymbol } from '../data/abortedSymbol.js';

export interface CustomHttpResponse extends HttpResponse {
  [abortedSymbol]?: boolean;
}
