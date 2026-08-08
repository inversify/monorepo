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
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3000),
});

type AppConfig = z.infer<typeof appConfigSchema>;

export async function bootstrap(): Promise<AppConfig> {
  const container: Container = new Container();

  await container.loadAsync(
    ConfigContainerModule.fromOptions({
      source: object({
        DATABASE_URL: 'postgres://localhost:5432/app',
        PORT: '3000',
      }),
      validate: appConfigSchema,
    }),
  );

  return container.get<ConfigService<AppConfig>>(configServiceIdentifier).get();
}
// End-example
