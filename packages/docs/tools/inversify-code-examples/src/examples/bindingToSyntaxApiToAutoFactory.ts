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
    @inject('Factory<Katana>') katanaFactory: interfaces.AutoFactory<Katana>,
    @inject('Shuriken') shuriken: Shuriken,
  ) {
    this.#katana = katanaFactory();
    this.#shuriken = shuriken;
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

container.bind('Katana').to(Katana);
container.bind('Shuriken').to(Shuriken);

container
  .bind<interfaces.Factory<Katana>>('Factory<Katana>')
  .toAutoFactory<Katana>('Katana');

container.bind(Ninja).toSelf();
// End-example

export { container, Ninja };
