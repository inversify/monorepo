// Is-inversify-import-example
import { Container, type Newable } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();

// v6: container.bind('WeaponConstructor').toConstructor(Katana);
container.bind<Newable<Weapon>>('WeaponConstructor').toConstantValue(Katana);

export const weaponClass: Newable<Weapon> =
  container.get<Newable<Weapon>>('WeaponConstructor');

export const weapon: Weapon = new weaponClass();
// End-example
