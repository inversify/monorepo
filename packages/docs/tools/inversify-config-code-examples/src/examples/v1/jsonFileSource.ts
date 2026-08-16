// Begin-example
import { type ConfigSource, jsonFile } from '@inversifyjs/config';

export const source: ConfigSource = jsonFile({
  path: './config.json',
});
// End-example
