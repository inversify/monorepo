import { inject, injectable } from 'inversify';

import { type Execution } from '../../domain/models/Execution.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import {
  type CompletedExecutionsFindQuery,
  type ExecutionsFindQuery,
  type OngoingExecutionsFindQuery,
} from '../models/ExecutionsFindQuery.js';
import { type ExecutionsFindQueryResult } from '../models/ExecutionsFindQueryResult.js';
import { type OngoingExecutionsFindQueryResult } from '../models/OngoingExecutionsFindQueryResult.js';
import {
  type ExecutionPersistenceOutputPort,
  executionPersistenceOutputPortService,
} from './ExecutionPersistenceOutputPort.js';

@injectable()
export class ExecutionManagementInputPort {
  readonly #executionPersistenceOutputPort: ExecutionPersistenceOutputPort;

  constructor(
    @inject(executionPersistenceOutputPortService)
    executionPersistenceOutputPort: ExecutionPersistenceOutputPort,
  ) {
    this.#executionPersistenceOutputPort = executionPersistenceOutputPort;
  }

  public async create(execution: Execution): Promise<void> {
    await this.#executionPersistenceOutputPort.create(execution);
  }

  public async update(command: ExecuteUpdateCommand): Promise<void> {
    await this.#executionPersistenceOutputPort.update(command);
  }

  public async find(
    query: OngoingExecutionsFindQuery,
  ): Promise<OngoingExecutionsFindQueryResult>;
  public async find(
    query: CompletedExecutionsFindQuery,
  ): Promise<ExecutionsFindQueryResult>;
  public async find(
    query: ExecutionsFindQuery,
  ): Promise<ExecutionsFindQueryResult | OngoingExecutionsFindQueryResult> {
    if (query.filter.response === null) {
      return this.#executionPersistenceOutputPort.find({
        filter: query.filter,
        limit: query.limit,
        offset: query.offset,
      });
    }

    return this.#executionPersistenceOutputPort.find({
      filter: query.filter,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
