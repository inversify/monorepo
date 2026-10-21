import { type CallsFilterQuery } from './CallsFilterQuery.js';
import { type CallsSetQuery } from './CallsSetQuery.js';

export interface ExecuteUpdateCommand {
  readonly filter: CallsFilterQuery;
  readonly set: CallsSetQuery;
}
