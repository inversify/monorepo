import { LoggerOptions } from '../../model/LoggerOptions';
import { LogLevel } from '../../model/LogLevel';
import { ContextMetadata } from '../models/ContextMetadata';
import { Logger } from '../models/Logger';

type InternalLoggerOptions = Required<LoggerOptions>;

export abstract class LoggerAdapter implements Logger {
  protected readonly _loggerOptions: InternalLoggerOptions;
  readonly #context: string | undefined;

  constructor(context?: string, loggerOptions?: LoggerOptions) {
    this._loggerOptions = this.#parseLoggingOptions(loggerOptions);
    this.#context = context;
  }

  public info(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.INFO, message, contextMetadata);
  }

  public http(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.HTTP, message, contextMetadata);
  }

  public silly(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.SILLY, message, contextMetadata);
  }

  public log(
    logType: LogLevel,
    message: string,
    contextMetadata?: ContextMetadata,
  ): void {
    if (this._loggerOptions.logTypes.includes(logType)) {
      this.printLog(logType, message, {
        ...contextMetadata,
        context: contextMetadata?.context ?? this.#context,
      });
    }
  }

  public error(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.ERROR, message, contextMetadata);
  }

  public warn(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.WARN, message, contextMetadata);
  }

  public debug(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.DEBUG, message, contextMetadata);
  }

  public verbose(message: string, contextMetadata?: ContextMetadata): void {
    this.log(LogLevel.VERBOSE, message, contextMetadata);
  }

  #parseLoggingOptions(
    loggerOptions: LoggerOptions | undefined,
  ): InternalLoggerOptions {
    return {
      json: loggerOptions?.json ?? false,
      logTypes: loggerOptions?.logTypes ?? [
        LogLevel.DEBUG,
        LogLevel.ERROR,
        LogLevel.HTTP,
        LogLevel.INFO,
        LogLevel.SILLY,
        LogLevel.VERBOSE,
        LogLevel.WARN,
      ],
      timestamp: loggerOptions?.timestamp ?? true,
    };
  }

  protected abstract printLog(
    logType: LogLevel,
    message: string,
    context?: ContextMetadata,
  ): void;
}
