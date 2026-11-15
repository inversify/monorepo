import type { Container } from 'inversify';

import { type CommandHandlerConfig } from './CommandHandlerConfig.js';
import { type TransportProviderConfig } from './TransportProviderConfig.js';

export interface TransportProvider<TParams> {
  getConfigList(): Iterable<TransportProviderConfig<TParams>>;
  getIdentifier(): string | symbol;
  initialize(
    container: Container,
    configList: Iterable<CommandHandlerConfig>,
  ): Promise<void>;
  send(command: object, params: TParams): Promise<void>;
}
