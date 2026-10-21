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

import { type CompletedCallsFindQuery } from '../../../application/models/CallsFindQuery.js';
import { type CallsFindQueryResult } from '../../../application/models/CallsFindQueryResult.js';
import { type CallManagementInputPort } from '../../../application/ports/CallManagementInputPort.js';
import { CallFixtures } from '../../../domain/fixtures/CallFixtures.js';
import { type Call } from '../../../domain/models/Call.js';
import { type CallsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/CallsFindQueryFromGetInsightsV1QueryBuilder.js';
import { type CallsFindQueryFromCallIdBuilder } from '../builders/CallsFindQueryFromCallIdBuilder.js';
import { CallsController } from './CallsController.js';

describe(CallsController, () => {
  let callsFindQueryFromGetInsightsV1QueryBuilderMock: Mocked<CallsFindQueryFromGetInsightsV1QueryBuilder>;
  let callsFindQueryFromInsightsIdBuilderMock: Mocked<CallsFindQueryFromCallIdBuilder>;
  let callManagementInputPortMock: Mocked<CallManagementInputPort>;

  let callController: CallsController;

  beforeAll(() => {
    callsFindQueryFromGetInsightsV1QueryBuilderMock = {
      build: vitest.fn(),
    };
    callsFindQueryFromInsightsIdBuilderMock = {
      build: vitest.fn(),
    };
    callManagementInputPortMock = {
      create: vitest.fn(),
      find: vitest.fn() as unknown,
      update: vitest.fn(),
    } as Partial<
      Mocked<CallManagementInputPort>
    > as Mocked<CallManagementInputPort>;

    callController = new CallsController(
      callsFindQueryFromGetInsightsV1QueryBuilderMock,
      callsFindQueryFromInsightsIdBuilderMock,
      callManagementInputPortMock,
    );
  });

  describe('.getCall', () => {
    describe('having a call id', () => {
      let callIdFixture: string;
      let findQueryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        callIdFixture = CallFixtures.any.id;
        findQueryFixture = {
          filter: {
            id: callIdFixture,
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

      describe('when called, and a completed call is found', () => {
        let callFixture: Call;
        let result: unknown;

        beforeAll(async () => {
          callFixture = CallFixtures.any;

          callsFindQueryFromInsightsIdBuilderMock.build.mockReturnValueOnce(
            findQueryFixture,
          );
          callManagementInputPortMock.find.mockResolvedValueOnce({
            items: [callFixture],
            total: 1,
          } satisfies CallsFindQueryResult);

          result = await callController.getCall(callIdFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call CallsFindQueryFromInsightsIdBuilder.build()', () => {
          expect(
            callsFindQueryFromInsightsIdBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(callIdFixture);
        });

        it('should call CallManagementInputPort.find()', () => {
          expect(
            callManagementInputPortMock.find,
          ).toHaveBeenCalledExactlyOnceWith(findQueryFixture);
        });

        it('should return an Call', () => {
          expect(result).toBe(callFixture);
        });
      });

      describe('when called, and no completed call is found', () => {
        let result: unknown;

        beforeAll(async () => {
          callsFindQueryFromInsightsIdBuilderMock.build.mockReturnValueOnce(
            findQueryFixture,
          );
          callManagementInputPortMock.find.mockResolvedValueOnce({
            items: [],
            total: 0,
          } satisfies CallsFindQueryResult);

          result = await callController.getCall(callIdFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call CallsFindQueryFromInsightsIdBuilder.build()', () => {
          expect(
            callsFindQueryFromInsightsIdBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(callIdFixture);
        });

        it('should call CallManagementInputPort.find()', () => {
          expect(
            callManagementInputPortMock.find,
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
