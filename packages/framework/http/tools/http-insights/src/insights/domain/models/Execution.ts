import { type BaseExecution } from './BaseExecution.js';
import { type Response } from './Response.js';

export interface Execution extends BaseExecution {
  readonly response: Response;
}
