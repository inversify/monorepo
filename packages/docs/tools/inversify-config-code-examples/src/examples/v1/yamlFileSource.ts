// Begin-example
import { type ConfigSource } from '@inversifyjs/config';
import { yamlFile } from '@inversifyjs/config-yaml';

export const source: ConfigSource = yamlFile({
  path: './config.yaml',
});
// End-example
