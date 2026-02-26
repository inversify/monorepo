// Is-inversify-import-example
import { Container, inject, injectable, named } from 'inversify8';

interface Weapon {
  readonly damage: number;
}

@injectable()
export class Katana implements Weapon {
  public readonly damage: number = 10;
}

@injectable()
export class Shuriken implements Weapon {
  public readonly damage: number = 5;
}

// Begin-example
@injectable()
class Ninja {
  public katana: Weapon;
  public shuriken: Weapon;
  constructor(
    @inject('Weapon') @named('melee') katana: Weapon,
    @inject('Weapon') @named('ranged') shuriken: Weapon,
  ) {
    this.katana = katana;
    this.shuriken = shuriken;
  }
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenNamed('melee');
container.bind<Weapon>('Weapon').to(Shuriken).whenNamed('ranged');
container.bind(Ninja).toSelf();

const ninja: Ninja = container.get(Ninja);
// End-example

export { ninja };
