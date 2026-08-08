// Begin-example
import { type ConfigSource } from '@inversifyjs/config';
import { envFile } from '@inversifyjs/config-dotenv';

export const source: ConfigSource = envFile({
  path: ['.env', `.env.${process.env['NODE_ENV'] ?? 'development'}`],
});
// End-example
