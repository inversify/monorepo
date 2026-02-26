// Is-inversify-import-example
import { Container, injectable, multiInject } from 'inversify8';

export interface Weapon {
  damage: number;
}

const weaponServiceId: symbol = Symbol.for('WeaponServiceId');

@injectable()
class Katana {
  public readonly damage: number = 10;
}

// Begin-example
@injectable()
class Ninja {
  @multiInject(weaponServiceId)
  public readonly weapon!: Weapon[];
}

const container: Container = new Container();

container.bind(Ninja).toSelf();
container.bind(weaponServiceId).to(Katana);

const ninja: Ninja = container.get(Ninja);

// Returns 10
const ninjaWeaponDamage: number | undefined = ninja.weapon[0]?.damage;
// End-example

export { ninjaWeaponDamage };
