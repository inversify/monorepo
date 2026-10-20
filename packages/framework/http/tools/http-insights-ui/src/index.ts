import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory: string = dirname(fileURLToPath(import.meta.url));

export const httpInsightsUiBundleDirectory: string = join(
  moduleDirectory,
  '..',
  'dist',
);

export const httpInsightsUiPath: string = '/.inversify/http-insights-ui';
