import { type Execution } from '../../domain/models/Execution.js';

export interface ExecutionsFindQueryResult {
  readonly items: Execution[];
  readonly total: number;
}
