// Is-inversify-import-example
import { Container, inject, injectable, ResolutionContext } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;

  public hit(): string {
    return 'hit!';
  }
}

// Begin-example
@injectable()
export class Ninja {
  readonly #katana: Katana;

  constructor(@inject('Factory<Katana>') katanaFactory: () => Katana) {
    this.#katana = katanaFactory();
  }

  public fight(): string {
    return this.#katana.hit();
  }
}

export const container: Container = new Container();

container.bind('Katana').to(Katana);

// v6: container.bind('Factory<Katana>').toAutoFactory<Katana>('Katana');
container
  .bind<() => Katana>('Factory<Katana>')
  .toFactory(
    (context: ResolutionContext) => () => context.get<Katana>('Katana'),
  );

container.bind(Ninja).toSelf();
// End-example
