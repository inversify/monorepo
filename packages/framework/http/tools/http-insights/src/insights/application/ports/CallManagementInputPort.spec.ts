import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { CallFixtures } from '../../domain/fixtures/CallFixtures.js';
import { HttpErrorFixtures } from '../../domain/fixtures/HttpErrorFixtures.js';
import { type Call } from '../../domain/models/Call.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import { CallManagementInputPort } from './CallManagementInputPort.js';
import { type CallPersistenceOutputPort } from './CallPersistenceOutputPort.js';

describe(CallManagementInputPort, () => {
  let callPersistenceOutputPortMock: Mocked<CallPersistenceOutputPort>;
  let callManagementInputPort: CallManagementInputPort;

  beforeAll(() => {
    callPersistenceOutputPortMock = {
      create: vitest.fn(),
      find: vitest.fn() as unknown,
      update: vitest.fn(),
    } as Partial<
      Mocked<CallPersistenceOutputPort>
    > as Mocked<CallPersistenceOutputPort>;

    callManagementInputPort = new CallManagementInputPort(
      callPersistenceOutputPortMock,
    );
  });

  describe('.create', () => {
    describe('when called', () => {
      let callFixture: Call;

      beforeAll(async () => {
        callFixture = CallFixtures.any;

        await callManagementInputPort.create(callFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should persist the call', () => {
        expect(
          callPersistenceOutputPortMock.create,
        ).toHaveBeenCalledExactlyOnceWith(callFixture);
      });
    });
  });

  describe('.update', () => {
    describe('when called', () => {
      let commandFixture: ExecuteUpdateCommand;

      beforeAll(async () => {
        commandFixture = {
          filter: {
            id: 'call-id',
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          set: {
            httpErrors: [HttpErrorFixtures.any],
          },
        };

        await callManagementInputPort.update(commandFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should persist the update', () => {
        expect(
          callPersistenceOutputPortMock.update,
        ).toHaveBeenCalledExactlyOnceWith(commandFixture);
      });
    });
  });
});
