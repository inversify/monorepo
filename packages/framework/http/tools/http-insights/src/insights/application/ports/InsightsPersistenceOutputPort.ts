import { type InsightsFindQuery } from '../models/InsightsFindQuery.js';
import { type InsightsFindQueryResult } from '../models/InsightsFindQueryResult.js';

export const insightsPersistenceOutputPortService: symbol = Symbol(
  'InsightsPersistenceOutputPortService',
);

export interface InsightsPersistenceOutputPort {
  find(query: InsightsFindQuery): Promise<InsightsFindQueryResult>;
}
