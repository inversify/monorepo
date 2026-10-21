import { inject, injectable } from 'inversify';

import { type Call } from '../../domain/models/Call.js';
import {
  type CallsFindQuery,
  type CompletedCallsFindQuery,
  type OngoingCallsFindQuery,
} from '../models/CallsFindQuery.js';
import { type CallsFindQueryResult } from '../models/CallsFindQueryResult.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import { type OngoingCallsFindQueryResult } from '../models/OngoingCallsFindQueryResult.js';
import {
  type CallPersistenceOutputPort,
  callPersistenceOutputPortService,
} from './CallPersistenceOutputPort.js';

@injectable()
export class CallManagementInputPort {
  readonly #callPersistenceOutputPort: CallPersistenceOutputPort;

  constructor(
    @inject(callPersistenceOutputPortService)
    callPersistenceOutputPort: CallPersistenceOutputPort,
  ) {
    this.#callPersistenceOutputPort = callPersistenceOutputPort;
  }

  public async create(call: Call): Promise<void> {
    await this.#callPersistenceOutputPort.create(call);
  }

  public async update(command: ExecuteUpdateCommand): Promise<void> {
    await this.#callPersistenceOutputPort.update(command);
  }

  public async find(
    query: OngoingCallsFindQuery,
  ): Promise<OngoingCallsFindQueryResult>;
  public async find(
    query: CompletedCallsFindQuery,
  ): Promise<CallsFindQueryResult>;
  public async find(
    query: CallsFindQuery,
  ): Promise<CallsFindQueryResult | OngoingCallsFindQueryResult> {
    if (query.filter.response === null) {
      return this.#callPersistenceOutputPort.find({
        filter: query.filter,
        limit: query.limit,
        offset: query.offset,
      });
    }

    return this.#callPersistenceOutputPort.find({
      filter: query.filter,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
