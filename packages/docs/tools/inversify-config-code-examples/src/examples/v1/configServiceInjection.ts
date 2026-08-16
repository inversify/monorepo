// Begin-example
import {
  type ConfigService,
  configServiceIdentifier,
} from '@inversifyjs/config';
import { inject, injectable } from 'inversify';

interface AppConfig {
  PORT: number;
}

@injectable()
export class App {
  readonly #configService: ConfigService<AppConfig>;

  constructor(
    @inject(configServiceIdentifier)
    configService: ConfigService<AppConfig>,
  ) {
    this.#configService = configService;
  }

  public getPort(): number {
    return this.#configService.get().PORT;
  }
}
// End-example
