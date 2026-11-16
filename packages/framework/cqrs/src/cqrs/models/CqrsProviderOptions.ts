import { type Logger } from '@inversifyjs/logger';

export interface CqrsProviderOptions {
  logger?: boolean | Logger;
}
