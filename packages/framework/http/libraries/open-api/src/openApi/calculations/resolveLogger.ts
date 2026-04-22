import { ConsoleLogger, type Logger } from '@inversifyjs/logger';

export function resolveLogger(
  option: Logger | boolean | undefined,
): Logger | undefined {
  if (option === false) {
    return undefined;
  }

  if (option === true || option === undefined) {
    return new ConsoleLogger();
  }

  return option;
}
