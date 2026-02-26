// Is-inversify-import-example
import { Container, inject, injectable, injectFromBase } from 'inversify8';

const container: Container = new Container();

// Begin-example
type Weapon = unknown;

@injectable()
abstract class BaseSoldier {
  public weapon: Weapon;
  constructor(@inject('Weapon') weapon: Weapon) {
    this.weapon = weapon;
  }
}

@injectable()
@injectFromBase({
  extendConstructorArguments: true,
  extendProperties: false,
})
class Soldier extends BaseSoldier {}

// Exclude-from-example
{
  container.bind('Weapon').toConstantValue('sword');
  container.bind(Soldier).toSelf();
}

// Returns a soldier with a weapon
const soldier: Soldier = container.get(Soldier);
// End-example

export { soldier };
