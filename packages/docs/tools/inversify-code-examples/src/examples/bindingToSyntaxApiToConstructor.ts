// Is-inversify-import-example
import { Container, type interfaces } from 'inversify6';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();
container.bind<Weapon>('WeaponConstructor').toConstructor(Katana);

const katanaConstructor: interfaces.Newable<Weapon> =
  container.get<interfaces.Newable<Weapon>>('WeaponConstructor');
// End-example

export { katanaConstructor };
