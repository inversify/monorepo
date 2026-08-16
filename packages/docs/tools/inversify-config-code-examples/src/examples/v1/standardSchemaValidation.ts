/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/typedef */

// Begin-example
import {
  ConfigContainerModule,
  type ConfigService,
  configServiceIdentifier,
  object,
} from '@inversifyjs/config';
import { Container } from 'inversify';
import { z } from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
});

type AppConfig = z.infer<typeof appConfigSchema>;

export async function bootstrap(): Promise<AppConfig> {
  const container: Container = new Container();

  await container.loadAsync(
    ConfigContainerModule.fromOptions({
      source: object({
        NODE_ENV: 'production',
        PORT: '8080',
      }),
      validate: appConfigSchema,
    }),
  );

  return container.get<ConfigService<AppConfig>>(configServiceIdentifier).get();
}
// End-example
