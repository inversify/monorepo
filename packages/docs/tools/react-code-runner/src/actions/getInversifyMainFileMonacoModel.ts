import type * as monaco from 'monaco-editor';

export default function getInversifyMainFileMonacoModel(
  monacoImport: typeof monaco,
): monaco.editor.ITextModel {
  const uri: monaco.Uri = monacoImport.Uri.parse('file:///main.ts');

  return (
    monacoImport.editor.getModel(uri) ??
    monacoImport.editor.createModel(
      `
import { Container, inject, injectable } from 'inversify';

@injectable()
class Weapon {
  damage = 10;
}

@injectable()
class Ninja {
  public readonly weapon: Weapon;

  constructor(@inject(Weapon) weapon: Weapon) {
    this.weapon = weapon;
  }
}

export default async () => {
  const container = new Container();

  container.bind(Ninja).toSelf().inSingletonScope();
  container.bind(Weapon).toSelf().inSingletonScope();

  const ninja = container.get(Ninja);

  console.log(JSON.stringify(ninja));
}
`.trim(),
      'typescript',
      uri,
    )
  );
}
