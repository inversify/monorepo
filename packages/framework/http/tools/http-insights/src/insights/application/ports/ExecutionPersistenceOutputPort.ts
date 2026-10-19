import { type Execution } from '../../domain/models/Execution.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import {
  type CompletedExecutionsFindQuery,
  type OngoingExecutionsFindQuery,
} from '../models/ExecutionsFindQuery.js';
import { type ExecutionsFindQueryResult } from '../models/ExecutionsFindQueryResult.js';
import { type OngoingExecutionsFindQueryResult } from '../models/OngoingExecutionsFindQueryResult.js';

export const executionPersistenceOutputPortService: symbol = Symbol(
  'ExecutionPersistenceOutputPortService',
);

export interface ExecutionPersistenceOutputPort {
  create(execution: Execution): Promise<void>;
  find(
    query: OngoingExecutionsFindQuery,
  ): Promise<OngoingExecutionsFindQueryResult>;
  find(query: CompletedExecutionsFindQuery): Promise<ExecutionsFindQueryResult>;
  update(command: ExecuteUpdateCommand): Promise<void>;
}
