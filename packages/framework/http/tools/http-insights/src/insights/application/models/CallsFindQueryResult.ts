import { type Call } from '../../domain/models/Call.js';

export interface CallsFindQueryResult {
  readonly items: Call[];
  readonly total: number;
}
