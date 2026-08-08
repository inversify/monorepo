// Begin-example
import { type ConfigSource, factory } from '@inversifyjs/config';

export const source: ConfigSource = factory(() => ({
  PORT: Number(process.env['PORT'] ?? '3000'),
}));
// End-example
