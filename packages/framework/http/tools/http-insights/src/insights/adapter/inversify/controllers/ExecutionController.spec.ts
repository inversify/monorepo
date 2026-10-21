import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { HttpStatusCode, NotFoundHttpResponse } from '@inversifyjs/http-core';

import { type CompletedExecutionsFindQuery } from '../../../application/models/ExecutionsFindQuery.js';
import { type ExecutionsFindQueryResult } from '../../../application/models/ExecutionsFindQueryResult.js';
import { type ExecutionManagementInputPort } from '../../../application/ports/ExecutionManagementInputPort.js';
import { ExecutionFixtures } from '../../../domain/fixtures/ExecutionFixtures.js';
import { type Execution } from '../../../domain/models/Execution.js';
import { type ExecutionsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/ExecutionsFindQueryFromGetInsightsV1QueryBuilder.js';
import { type ExecutionsFindQueryFromInsightsIdBuilder } from '../builders/ExecutionsFindQueryFromInsightsIdBuilder.js';
import { ExecutionController } from './ExecutionController.js';

describe(ExecutionController, () => {
  let executionsFindQueryFromGetInsightsV1QueryBuilderMock: Mocked<ExecutionsFindQueryFromGetInsightsV1QueryBuilder>;
  let executionsFindQueryFromInsightsIdBuilderMock: Mocked<ExecutionsFindQueryFromInsightsIdBuilder>;
  let executionManagementInputPortMock: Mocked<ExecutionManagementInputPort>;

  let executionController: ExecutionController;

  beforeAll(() => {
    executionsFindQueryFromGetInsightsV1QueryBuilderMock = {
      build: vitest.fn(),
    };
    executionsFindQueryFromInsightsIdBuilderMock = {
      build: vitest.fn(),
    };
    executionManagementInputPortMock = {
      create: vitest.fn(),
      find: vitest.fn() as unknown,
      update: vitest.fn(),
    } as Partial<
      Mocked<ExecutionManagementInputPort>
    > as Mocked<ExecutionManagementInputPort>;

    executionController = new ExecutionController(
      executionsFindQueryFromGetInsightsV1QueryBuilderMock,
      executionsFindQueryFromInsightsIdBuilderMock,
      executionManagementInputPortMock,
    );
  });

  describe('.getExecution', () => {
    describe('having an execution id', () => {
      let executionIdFixture: string;
      let findQueryFixture: CompletedExecutionsFindQuery;

      beforeAll(() => {
        executionIdFixture = ExecutionFixtures.any.id;
        findQueryFixture = {
          filter: {
            id: executionIdFixture,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: 1,
          offset: undefined,
        };
      });

      describe('when called, and a completed execution is found', () => {
        let executionFixture: Execution;
        let result: unknown;

        beforeAll(async () => {
          executionFixture = ExecutionFixtures.any;

          executionsFindQueryFromInsightsIdBuilderMock.build.mockReturnValueOnce(
            findQueryFixture,
          );
          executionManagementInputPortMock.find.mockResolvedValueOnce({
            items: [executionFixture],
            total: 1,
          } satisfies ExecutionsFindQueryResult);

          result = await executionController.getExecution(executionIdFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call ExecutionsFindQueryFromInsightsIdBuilder.build()', () => {
          expect(
            executionsFindQueryFromInsightsIdBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(executionIdFixture);
        });

        it('should call ExecutionManagementInputPort.find()', () => {
          expect(
            executionManagementInputPortMock.find,
          ).toHaveBeenCalledExactlyOnceWith(findQueryFixture);
        });

        it('should return an Execution', () => {
          expect(result).toBe(executionFixture);
        });
      });

      describe('when called, and no completed execution is found', () => {
        let result: unknown;

        beforeAll(async () => {
          executionsFindQueryFromInsightsIdBuilderMock.build.mockReturnValueOnce(
            findQueryFixture,
          );
          executionManagementInputPortMock.find.mockResolvedValueOnce({
            items: [],
            total: 0,
          } satisfies ExecutionsFindQueryResult);

          result = await executionController.getExecution(executionIdFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call ExecutionsFindQueryFromInsightsIdBuilder.build()', () => {
          expect(
            executionsFindQueryFromInsightsIdBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(executionIdFixture);
        });

        it('should call ExecutionManagementInputPort.find()', () => {
          expect(
            executionManagementInputPortMock.find,
          ).toHaveBeenCalledExactlyOnceWith(findQueryFixture);
        });

        it('should return a NotFoundHttpResponse', () => {
          expect(result).toBeInstanceOf(NotFoundHttpResponse);
          expect((result as NotFoundHttpResponse).statusCode).toBe(
            HttpStatusCode.NOT_FOUND,
          );
        });
      });
    });
  });
});
