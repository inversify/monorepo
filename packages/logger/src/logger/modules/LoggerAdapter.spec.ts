import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { LogLevel } from '../../model/LogLevel';
import { ContextMetadata } from '../models/ContextMetadata';
import { LoggerAdapter } from './LoggerAdapter';

class LoggerAdapterMock extends LoggerAdapter {
  readonly #printLogMock: Mock<
    (logType: LogLevel, message: string, context?: ContextMetadata) => void
  >;

  constructor(
    printLogMock: Mock<
      (logType: LogLevel, message: string, context?: ContextMetadata) => void
    >,
    context?: string,
    loggerOptions?: { json: boolean; logTypes: LogLevel[]; timestamp: boolean },
  ) {
    super(context, loggerOptions);

    this.#printLogMock = printLogMock;
  }

  protected override printLog(
    logType: LogLevel,
    message: string,
    context?: ContextMetadata,
  ): void {
    this.#printLogMock(logType, message, context);
  }
}

describe(LoggerAdapter, () => {
  let printLogMock: Mock<
    (logType: LogLevel, message: string, context?: ContextMetadata) => void
  >;
  let loggerAdapter: LoggerAdapterMock;

  beforeAll(() => {
    printLogMock = vitest.fn();
    loggerAdapter = new LoggerAdapterMock(printLogMock);
  });

  describe('.info', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'test message';
      contextMetadataFixture = { context: 'test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.info(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.INFO', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.INFO,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.http', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'http test message';
      contextMetadataFixture = { context: 'http test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.http(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.HTTP', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.HTTP,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.silly', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'silly test message';
      contextMetadataFixture = { context: 'silly test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.silly(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.SILLY', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.SILLY,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.error', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'error test message';
      contextMetadataFixture = { context: 'error test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.error(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.ERROR', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.ERROR,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.warn', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'warn test message';
      contextMetadataFixture = { context: 'warn test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.warn(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.WARN', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.WARN,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.debug', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'debug test message';
      contextMetadataFixture = { context: 'debug test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.debug(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.DEBUG', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.DEBUG,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.verbose', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata;

    beforeAll(() => {
      messageFixture = 'verbose test message';
      contextMetadataFixture = { context: 'verbose test context' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.verbose(messageFixture, contextMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with LogType.VERBOSE', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          LogLevel.VERBOSE,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.log', () => {
    let messageFixture: string;
    let contextMetadataFixture: ContextMetadata | undefined;
    let logTypeFixture: LogLevel;

    beforeAll(() => {
      messageFixture = 'log test message';
      contextMetadataFixture = { context: 'log test context' };
      logTypeFixture = LogLevel.INFO;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = loggerAdapter.log(
          logTypeFixture,
          messageFixture,
          contextMetadataFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call printLog with the provided parameters', () => {
        expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
          logTypeFixture,
          messageFixture,
          contextMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('having a log type not included in logTypes', () => {
      let restrictedLoggerAdapter: LoggerAdapterMock;

      beforeAll(() => {
        restrictedLoggerAdapter = new LoggerAdapterMock(
          printLogMock,
          undefined,
          {
            json: true,
            logTypes: [LogLevel.ERROR], // Only ERROR logs allowed
            timestamp: true,
          },
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = restrictedLoggerAdapter.log(
            LogLevel.INFO,
            messageFixture,
            contextMetadataFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call printLog', () => {
          expect(printLogMock).not.toHaveBeenCalled();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a LoggerAdapter with context', () => {
      let contextFixture: string;
      let loggerAdapterWithContext: LoggerAdapterMock;

      beforeAll(() => {
        contextFixture = 'constructor context';
        loggerAdapterWithContext = new LoggerAdapterMock(
          printLogMock,
          contextFixture,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = loggerAdapterWithContext.log(logTypeFixture, messageFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call printLog with context from constructor', () => {
          expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
            logTypeFixture,
            messageFixture,
            { context: contextFixture },
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a LoggerAdapter with context and explicit context', () => {
      let constructorContextFixture: string;
      let explicitContextFixture: string;
      let loggerAdapterWithContext: LoggerAdapterMock;

      beforeAll(() => {
        constructorContextFixture = 'constructor context';
        explicitContextFixture = 'explicit context';
        loggerAdapterWithContext = new LoggerAdapterMock(
          printLogMock,
          constructorContextFixture,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = loggerAdapterWithContext.log(
            logTypeFixture,
            messageFixture,
            {
              context: explicitContextFixture,
            },
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call printLog with the explicit context', () => {
          expect(printLogMock).toHaveBeenCalledExactlyOnceWith(
            logTypeFixture,
            messageFixture,
            { context: explicitContextFixture },
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
