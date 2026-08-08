// Begin-example
import { type ConfigSource, processEnv } from '@inversifyjs/config';

export const source: ConfigSource = processEnv({
  pick: ['DATABASE_URL', 'PORT'],
});
// End-example
