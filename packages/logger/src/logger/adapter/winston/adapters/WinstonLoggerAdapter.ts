import { type Format, type TransformableInfo } from 'logform';
import { format, type Logger } from 'winston';

import { type LoggerOptions } from '../../../../model/LoggerOptions.js';
import { type LogLevel } from '../../../../model/LogLevel.js';
import { type ContextMetadata } from '../../../models/ContextMetadata.js';
import { LoggerAdapter } from '../../../modules/LoggerAdapter.js';

export class WinstonLoggerAdapter extends LoggerAdapter {
  readonly #logger: Logger;

  constructor(logger: Logger, context?: string, loggerOptions?: LoggerOptions) {
    super(context, loggerOptions);
    this.#logger = logger;

    this.#formatLogger();
  }

  protected override printLog(
    logType: LogLevel,
    message: string,
    context?: ContextMetadata,
  ): void {
    this.#logger.log(logType, message, context);
  }

  #buildOptionsFormatList(): Format[] {
    const formatList: Format[] = [];

    if (this._loggerOptions.timestamp) {
      formatList.push(
        format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
      );
    }

    if (this._loggerOptions.json) {
      formatList.push(format.json(), format.prettyPrint());
    } else {
      formatList.push(
        format.colorize({ all: true }),
        format.printf((info: TransformableInfo): string =>
          this.#stringifyInfo(info),
        ),
      );
    }

    return formatList;
  }

  #formatLogger(): void {
    this.#logger.format = format.combine(
      this.#logger.format,
      ...this.#buildOptionsFormatList(),
    );
  }

  #stringifyInfo(info: TransformableInfo): string {
    const prefix: string =
      (info['context'] as string | undefined) ?? 'InversifyJS';

    return `[${prefix}] - ${String(process.pid)}${this._loggerOptions.timestamp ? ` ${info['timestamp'] as string}` : ''} ${info.level}: ${info.message as string}`;
  }
}
