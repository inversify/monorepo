// Is-inversify-import-example
import { Container, inject, injectable, type interfaces } from 'inversify';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;

  public hit(): unknown {
    return 'hit!';
  }
}

export class Shuriken implements Weapon {
  public readonly damage: number = 5;

  public throw(): unknown {
    return 'throw!';
  }
}

// Begin-example
@injectable()
class Ninja implements Ninja {
  readonly #katana: Katana;
  readonly #shuriken: Shuriken;

  constructor(
    @inject('Factory<Weapon>')
    katanaFactory: interfaces.AutoNamedFactory<Weapon>,
  ) {
    this.#katana = katanaFactory('katana') as Katana;
    this.#shuriken = katanaFactory('shuriken') as Shuriken;
  }

  public fight() {
    return this.#katana.hit();
  }

  public sneak() {
    return this.#shuriken.throw();
  }
}

// Exclude-from-example
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('katana');
container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('shuriken');
container
  .bind<interfaces.AutoNamedFactory<Weapon>>('Factory<Weapon>')
  .toAutoNamedFactory<Weapon>('Weapon');

container.bind(Ninja).toSelf();
// End-example

export { container, Ninja };
