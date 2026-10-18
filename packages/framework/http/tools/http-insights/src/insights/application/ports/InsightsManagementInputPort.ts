import { inject, injectable } from 'inversify';

import { InsightsFindQuery } from '../models/InsightsFindQuery.js';
import { InsightsFindQueryResult } from '../models/InsightsFindQueryResult.js';
import {
  type InsightsPersistenceOutputPort,
  insightsPersistenceOutputPortService,
} from './InsightsPersistenceOutputPort.js';

@injectable()
export class InsightsManagementInputPort {
  readonly #insightsPersistenceOutputPort: InsightsPersistenceOutputPort;

  constructor(
    @inject(insightsPersistenceOutputPortService)
    insightsPersistenceOutputPort: InsightsPersistenceOutputPort,
  ) {
    this.#insightsPersistenceOutputPort = insightsPersistenceOutputPort;
  }

  public async find(
    query: InsightsFindQuery,
  ): Promise<InsightsFindQueryResult> {
    return this.#insightsPersistenceOutputPort.find(query);
  }
}
