import type * as monaco from 'monaco-editor';

import inversifyTypes from '../../generated/types.d.ts.txt?raw';

let monacoImport: typeof monaco | undefined;

const fakePath: string = `file:///node_modules/@types/inversify.d.ts`;

export default async function getMonaco(): Promise<typeof monaco> {
  if (monacoImport === undefined) {
    monacoImport = await import('monaco-editor');

    monacoImport.typescript.typescriptDefaults.addExtraLib(
      inversifyTypes,
      fakePath,
    );

    monacoImport.typescript.typescriptDefaults.setCompilerOptions({
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      moduleResolution: monacoImport.typescript.ModuleResolutionKind.NodeJs,
      target: monacoImport.typescript.ScriptTarget.ES2020,
    });
  }

  return monacoImport;
}
