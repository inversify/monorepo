import type * as monaco from 'monaco-editor';

import inversifyTypes from '../../generated/types.d.ts.txt?raw';

let monacoImport: typeof monaco | undefined;

const fakePath: string = `file:///node_modules/@types/inversify.d.ts`;

export default async function getMonaco(): Promise<typeof monaco> {
  if (monacoImport === undefined) {
    monacoImport = await import('monaco-editor');

    monacoImport.languages.typescript.typescriptDefaults.addExtraLib(
      inversifyTypes,
      fakePath,
    );

    monacoImport.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      moduleResolution:
        monacoImport.languages.typescript.ModuleResolutionKind.NodeJs,
      target: monacoImport.languages.typescript.ScriptTarget.ES2020,
    });
  }

  return monacoImport;
}
