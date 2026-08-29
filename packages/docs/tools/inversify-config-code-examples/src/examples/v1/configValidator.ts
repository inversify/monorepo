// Begin-example
import {
  ConfigContainerModule,
  type ConfigObject,
  type ConfigService,
  type ConfigValidator,
  object,
} from '@inversifyjs/config';
import { Container } from 'inversify';
import { resolve } from 'rflct';

interface AppConfig {
  port: number;
}

const appConfigValidator: ConfigValidator<AppConfig> = {
  validate(input: ConfigObject): AppConfig {
    const port: number = Number(input['port']);

    if (!Number.isInteger(port) || port < 1) {
      throw new Error('port must be a positive integer');
    }

    return { port };
  },
};

export async function bootstrap(): Promise<AppConfig> {
  const container: Container = new Container();

  await container.loadAsync(
    ConfigContainerModule.fromOptions({
      source: object({ port: '3000' }),
      validate: appConfigValidator,
    }),
  );

  return container.get<ConfigService<AppConfig>>(resolve<ConfigService>()).get();
}
// End-example
