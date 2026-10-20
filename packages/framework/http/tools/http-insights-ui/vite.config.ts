import react from '@vitejs/plugin-react';
import { type ConfigEnv, defineConfig, type UserConfig } from 'vite';

export default defineConfig((environment: ConfigEnv): UserConfig => {
  const apiOrigin: string | undefined = process.env['HTTP_INSIGHTS_API_ORIGIN'];
  const config: UserConfig = {
    base: environment.command === 'serve' ? '/' : './',
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

  return config;
});
