import type { BabelFileResult, PluginObj } from '@babel/core';
import { availablePlugins, registerPlugin, transform } from '@babel/standalone';

export default function transformSourceCode(
  sourceCode: string,
  plugins: [string, () => PluginObj][],
): string {
  for (const [name, pluginFactory] of plugins) {
    if (availablePlugins[name] === undefined) {
      registerPlugin(name, pluginFactory);
    }
  }

  const result: BabelFileResult = transform(sourceCode, {
    filename: 'main.ts',
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      ...plugins.map(([name]: [string, () => PluginObj]) => [name] as any),
    ],
    sourceType: 'module',
  });

  return result.code ?? '';
}
