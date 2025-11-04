import { HttpResponse } from 'uWebSockets.js';

import { abortedSymbol } from '../data/abortedSymbol';

export interface CustomHttpResponse extends HttpResponse {
  [abortedSymbol]?: boolean;
}
