import { type HttpRequest } from 'uWebSockets.js';

import { type capturedRequestValuesSymbol } from '../data/capturedRequestValuesSymbol.js';
import { type CapturedRequestValues } from './CapturedRequestValues.js';

export interface CapturedHttpRequest extends HttpRequest {
  [capturedRequestValuesSymbol]?: CapturedRequestValues | undefined;
}
