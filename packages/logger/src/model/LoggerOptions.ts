import { type LogLevel } from './LogLevel.js';

export interface LoggerOptions {
  json?: boolean;
  logTypes?: LogLevel[];
  timestamp?: boolean;
}
