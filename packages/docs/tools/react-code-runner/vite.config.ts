/// <reference types="vite/client" />
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      outDir: 'lib/esm',
      tsconfigPath: 'tsconfig.esm.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@babel/standalone',
        '@swc/wasm-web',
        'monaco-editor',
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
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
        dir: 'lib/esm',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
        globals: {
          react: 'React',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
});
