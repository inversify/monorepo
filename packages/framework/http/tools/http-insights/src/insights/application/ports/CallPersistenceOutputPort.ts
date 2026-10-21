import { type Call } from '../../domain/models/Call.js';
import {
  type CompletedCallsFindQuery,
  type OngoingCallsFindQuery,
} from '../models/CallsFindQuery.js';
import { type CallsFindQueryResult } from '../models/CallsFindQueryResult.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import { type OngoingCallsFindQueryResult } from '../models/OngoingCallsFindQueryResult.js';

export const callPersistenceOutputPortService: symbol = Symbol(
  'CallPersistenceOutputPortService',
);

export interface CallPersistenceOutputPort {
  create(call: Call): Promise<void>;
  find(query: OngoingCallsFindQuery): Promise<OngoingCallsFindQueryResult>;
  find(query: CompletedCallsFindQuery): Promise<CallsFindQueryResult>;
  update(command: ExecuteUpdateCommand): Promise<void>;
}
