// Begin-example
import {
  type ConfigObject,
  type ConfigSource,
  object,
  processEnv,
} from '@inversifyjs/config';

export function mergedSource(): ConfigSource {
  const defaults: ConfigSource = object({
    PORT: '3000',
  });
  const env: ConfigSource = processEnv({
    pick: ['PORT', 'DATABASE_URL'],
  });

  return {
    async load(): Promise<ConfigObject> {
      return {
        ...(await Promise.resolve(defaults.load())),
        ...(await Promise.resolve(env.load())),
      };
    },
  };
}
// End-example
