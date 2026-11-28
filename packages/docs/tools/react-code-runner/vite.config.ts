/// <reference types="vite/client" />
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { globSync } from 'glob';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rolldownOptions: {
      external: [
        '@babel/standalone',
        '@swc/wasm-web',
        'monaco-editor',
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      input: Object.fromEntries([
        ...globSync([
          'src/components/**/index.tsx',
          'src/index.ts',
          'src/inversifyBundle.ts',
        ]).map((file) => {
          const entryName = path.relative(
            'src',
            file.slice(0, file.length - path.extname(file).length),
          );

          const entryUrl = fileURLToPath(new URL(file, import.meta.url));
          return [entryName, entryUrl];
        }),
      ]),
      output: {
        assetFileNames: 'assets/[name][extname]',
        dir: 'lib/esm',
        entryFileNames: '[name].js',
        globals: {
          react: 'React',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
  plugins: [
    react(),
    libInjectCss(),
    dts({
      outDirs: 'lib/esm',
      tsconfigPath: 'tsconfig.json',
    }),
  ],
});
