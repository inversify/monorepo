import { type LogLevel } from '../../model/LogLevel.js';
import { type ContextMetadata } from './ContextMetadata.js';

export interface Logger {
  log(logType: LogLevel, message: string, context?: ContextMetadata): void;
  error(message: string, context?: ContextMetadata): void;
  warn(message: string, context?: ContextMetadata): void;
  info(message: string, context?: ContextMetadata): void;
  http(message: string, context?: ContextMetadata): void;
  verbose(message: string, context?: ContextMetadata): void;
  debug(message: string, context?: ContextMetadata): void;
  silly(message: string, context?: ContextMetadata): void;
}
