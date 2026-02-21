// Imports added in order to detrect both modules
import type {} from '@inversifyjs/container';
import type {} from 'inversify';

import { PluginDispose } from './plugins/PluginDispose.js';

declare module '@inversifyjs/container' {
  interface Container {
    [Symbol.asyncDispose](): Promise<void>;
    [Symbol.dispose](): void;
  }
}

declare module 'inversify' {
  interface Container {
    [Symbol.asyncDispose](): Promise<void>;
    [Symbol.dispose](): void;
  }
}

export { PluginDispose };
