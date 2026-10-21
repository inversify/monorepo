import { type BaseCall } from './BaseCall.js';
import { type Response } from './Response.js';

export interface Call extends BaseCall {
  readonly response: Response;
}
