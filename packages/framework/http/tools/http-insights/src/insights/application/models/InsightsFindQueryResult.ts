import { type Execution } from '../../domain/models/Execution.js';

export interface InsightsFindQueryResult {
  readonly items: Execution[];
  readonly total: number;
}
