// Begin-example
import {
  ConfigContainerModule,
  type ConfigService,
  object,
} from '@inversifyjs/config';
import { Container, type ServiceIdentifier } from 'inversify';

export const appConfigServiceIdentifier: ServiceIdentifier<
  ConfigService<{ HOST: string }>
> = Symbol.for('appConfigService');

export async function bootstrap(): Promise<{ HOST: string }> {
  const container: Container = new Container();

  await container.loadAsync(
    ConfigContainerModule.fromOptions({
      serviceIdentifier: appConfigServiceIdentifier,
      source: object({ HOST: 'localhost' }),
    }),
  );

  return container.get(appConfigServiceIdentifier).get();
}
// End-example
