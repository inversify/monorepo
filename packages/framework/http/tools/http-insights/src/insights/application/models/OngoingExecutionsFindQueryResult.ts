import { type OngoingExecution } from '../../domain/models/OngoingExecution.js';

export interface OngoingExecutionsFindQueryResult {
  readonly items: OngoingExecution[];
  readonly total: number;
}
