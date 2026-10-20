import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

import { httpInsightsUiPath } from './src/index.js';

const apiOrigin: string | undefined = process.env['HTTP_INSIGHTS_API_ORIGIN'];
const configuredBase: string | undefined = process.env['HTTP_INSIGHTS_UI_BASE'];

const config: UserConfig = {
  base:
    configuredBase !== undefined && configuredBase.length > 0
      ? configuredBase
      : `${httpInsightsUiPath}/`,
  build: {
    emptyOutDir: true,
    outDir: 'dist',
  },
  plugins: [react()],
};

if (apiOrigin !== undefined && apiOrigin.length > 0) {
  config.server = {
    proxy: {
      '/.inversify': {
        changeOrigin: true,
        target: apiOrigin,
      },
    },
  };
}

export default defineConfig(config);
