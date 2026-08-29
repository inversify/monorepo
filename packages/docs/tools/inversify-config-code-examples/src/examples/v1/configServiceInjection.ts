// Begin-example
import { type ConfigService } from '@inversifyjs/config';
import { inject, injectable } from 'inversify';
import { resolve } from 'rflct';

interface AppConfig {
  PORT: number;
}

@injectable()
export class App {
  readonly #configService: ConfigService<AppConfig>;

  constructor(
    @inject(resolve<ConfigService>())
    configService: ConfigService<AppConfig>,
  ) {
    this.#configService = configService;
  }

  public getPort(): number {
    return this.#configService.get().PORT;
  }
}
// End-example
