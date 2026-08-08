// Begin-example
import { type ConfigSource, object } from '@inversifyjs/config';

export const source: ConfigSource = object({
  HOST: 'localhost',
  PORT: 3000,
});
// End-example
