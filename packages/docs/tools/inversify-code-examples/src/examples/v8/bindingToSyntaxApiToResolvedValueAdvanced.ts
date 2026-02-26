// Is-inversify-import-example
import { Container } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

export interface Arsenal {
  weapons: Weapon[];
}

// Begin-example
const container: Container = new Container();

container.bind(Katana).toSelf().whenNamed('katana');

container.bind<Arsenal>('Arsenal').toResolvedValue(
  (weapon: Weapon): Arsenal => ({
    weapons: [weapon],
  }),
  [
    {
      name: 'katana',
      serviceIdentifier: Katana,
    },
  ],
);

const arsenal: Arsenal = container.get('Arsenal');
// End-example

export { arsenal };
