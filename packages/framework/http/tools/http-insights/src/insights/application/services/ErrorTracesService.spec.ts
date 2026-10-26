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
import { ControllerFixtures } from '../../domain/fixtures/ControllerFixtures.js';
import { ErrorTraceFixtures } from '../../domain/fixtures/ErrorTraceFixtures.js';
import { HttpErrorFixtures } from '../../domain/fixtures/HttpErrorFixtures.js';
import { type Call } from '../../domain/models/Call.js';
import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import { type ErrorTracesReader } from '../ports/ErrorTracesReader.js';
import { ErrorTracesService } from './ErrorTracesService.js';

describe(ErrorTracesService, () => {
  let errorTracesReaderMock: Mocked<ErrorTracesReader>;
  let errorTracesService: ErrorTracesService;

  beforeAll(() => {
    errorTracesReaderMock = {
      read: vitest.fn(),
    };

    errorTracesService = new ErrorTracesService(errorTracesReaderMock);
  });

  describe('.capture', () => {
    describe('having stages that share one error', () => {
      let callFixture: Call;
      let errorFixture: Error;

      beforeAll(() => {
        errorFixture = new Error('boom');
        callFixture = {
          ...CallFixtures.any,
          controller: {
            ...ControllerFixtures.any,
            error: errorFixture,
            errorTraces: null,
          },
          guards: [],
          httpErrors: [
            {
              ...HttpErrorFixtures.any,
              error: errorFixture,
              errorTraces: null,
            },
          ],
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
        };
      });

      describe('when called, and the reader returns traces', () => {
        let result: unknown;

        beforeAll(async () => {
          errorTracesReaderMock.read.mockResolvedValue([
            ErrorTraceFixtures.any,
          ]);

          result = await errorTracesService.capture(callFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should read that error once', () => {
          expect(errorTracesReaderMock.read).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
          );
        });

        it('should attach the traces to every stage with that error', () => {
          const expected: Call = {
            ...callFixture,
            controller: {
              ...ControllerFixtures.any,
              error: errorFixture,
              errorTraces: [ErrorTraceFixtures.any],
            },
            httpErrors: [
              {
                ...HttpErrorFixtures.any,
                error: errorFixture,
                errorTraces: [ErrorTraceFixtures.any],
              },
            ],
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a stage without an error', () => {
      let callFixture: Call;

      beforeAll(() => {
        callFixture = {
          ...CallFixtures.any,
          controller: {
            ...ControllerFixtures.any,
            error: null,
            errorTraces: [ErrorTraceFixtures.any],
          },
          guards: [],
          httpErrors: [],
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          result = await errorTracesService.capture(callFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not read traces', () => {
          expect(errorTracesReaderMock.read).not.toHaveBeenCalled();
        });

        it('should store null traces', () => {
          const expected: Call = {
            ...callFixture,
            controller: {
              ...ControllerFixtures.any,
              error: null,
              errorTraces: null,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having an error the reader cannot trace', () => {
      let callFixture: Call;
      let errorFixture: Error;

      beforeAll(() => {
        errorFixture = new Error('boom');
        callFixture = {
          ...CallFixtures.any,
          controller: {
            ...ControllerFixtures.any,
            error: errorFixture,
            errorTraces: [ErrorTraceFixtures.any],
          },
          guards: [],
          httpErrors: [],
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
        };
      });

      describe('when called, and the reader returns null', () => {
        let result: unknown;

        beforeAll(async () => {
          errorTracesReaderMock.read.mockResolvedValue(null);

          result = await errorTracesService.capture(callFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should store null traces', () => {
          const expected: Call = {
            ...callFixture,
            controller: {
              ...ControllerFixtures.any,
              error: errorFixture,
              errorTraces: null,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having stages with different errors', () => {
      let callFixture: Call;
      let controllerErrorFixture: Error;
      let httpErrorFixture: Error;
      let controllerTracesFixture: readonly ErrorTrace[];
      let httpErrorTracesFixture: readonly ErrorTrace[];

      beforeAll(() => {
        controllerErrorFixture = new Error('controller');
        httpErrorFixture = new Error('http');
        controllerTracesFixture = [ErrorTraceFixtures.any];
        httpErrorTracesFixture = [
          {
            ...ErrorTraceFixtures.any,
            traceStatement: 'throw new Error("http");',
          },
        ];
        callFixture = {
          ...CallFixtures.any,
          controller: {
            ...ControllerFixtures.any,
            error: controllerErrorFixture,
            errorTraces: null,
          },
          guards: [],
          httpErrors: [
            {
              ...HttpErrorFixtures.any,
              error: httpErrorFixture,
              errorTraces: null,
            },
          ],
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
        };
      });

      describe('when called, and the reader returns a trace for each error', () => {
        let result: unknown;

        beforeAll(async () => {
          errorTracesReaderMock.read.mockImplementation(
            async (error: unknown): Promise<readonly ErrorTrace[] | null> => {
              if (error === controllerErrorFixture) {
                return controllerTracesFixture;
              }

              return httpErrorTracesFixture;
            },
          );

          result = await errorTracesService.capture(callFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should attach each trace to the stage that threw it', () => {
          const expected: Call = {
            ...callFixture,
            controller: {
              ...ControllerFixtures.any,
              error: controllerErrorFixture,
              errorTraces: controllerTracesFixture,
            },
            httpErrors: [
              {
                ...HttpErrorFixtures.any,
                error: httpErrorFixture,
                errorTraces: httpErrorTracesFixture,
              },
            ],
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });

  describe('.captureUpdate', () => {
    describe('having an http error', () => {
      let commandFixture: ExecuteUpdateCommand;
      let errorFixture: Error;

      beforeAll(() => {
        errorFixture = new Error('boom');
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
            httpErrors: [
              {
                ...HttpErrorFixtures.any,
                error: errorFixture,
                errorTraces: null,
              },
            ],
          },
        };
      });

      describe('when called, and the reader returns traces', () => {
        let result: unknown;

        beforeAll(async () => {
          errorTracesReaderMock.read.mockResolvedValue([
            ErrorTraceFixtures.any,
          ]);

          result = await errorTracesService.captureUpdate(commandFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should attach the traces to the http error', () => {
          const expected: ExecuteUpdateCommand = {
            ...commandFixture,
            set: {
              httpErrors: [
                {
                  ...HttpErrorFixtures.any,
                  error: errorFixture,
                  errorTraces: [ErrorTraceFixtures.any],
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
