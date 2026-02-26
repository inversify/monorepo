// Is-inversify-import-example
import { Container } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();

container.bind(Katana).toSelf();
container
  .bind<Weapon>('Weapon')
  .toResolvedValue((weapon: Weapon): Weapon => weapon, [Katana]);

const katana: Weapon = container.get<Weapon>('Weapon');
// End-example

export { katana };
