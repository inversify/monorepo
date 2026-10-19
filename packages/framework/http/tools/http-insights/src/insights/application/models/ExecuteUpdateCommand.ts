import { type ExecutionsFilterQuery } from './ExecutionsFilterQuery.js';
import { type ExecutionsSetQuery } from './ExecutionsSetQuery.js';

export interface ExecuteUpdateCommand {
  readonly filter: ExecutionsFilterQuery;
  readonly set: ExecutionsSetQuery;
}
