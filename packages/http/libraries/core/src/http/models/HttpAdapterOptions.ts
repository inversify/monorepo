import { Logger } from '@inversifyjs/logger';
import { CorsOptions } from 'cors';

export interface HttpAdapterOptions {
  logger?: boolean | Logger;
  cors?: boolean | CorsOptions;
}
