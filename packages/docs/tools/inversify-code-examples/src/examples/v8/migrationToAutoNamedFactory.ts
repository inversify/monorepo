// Is-inversify-import-example
import {
  Container,
  inject,
  injectable,
  MetadataName,
  ResolutionContext,
} from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;

  public hit(): string {
    return 'hit!';
  }
}

export class Shuriken implements Weapon {
  public readonly damage: number = 5;

  public throw(): string {
    return 'throw!';
  }
}

// Begin-example
@injectable()
export class Ninja {
  readonly #katana: Katana;
  readonly #shuriken: Shuriken;

  constructor(
    @inject('Factory<Weapon>')
    weaponFactory: (name: MetadataName) => Weapon,
  ) {
    this.#katana = weaponFactory('katana') as Katana;
    this.#shuriken = weaponFactory('shuriken') as Shuriken;
  }

  public fight(): string {
    return this.#katana.hit();
  }

  public sneak(): string {
    return this.#shuriken.throw();
  }
}

export const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana).whenNamed('katana');
container.bind<Weapon>('Weapon').to(Shuriken).whenNamed('shuriken');

// v6: container.bind('Factory<Weapon>').toAutoNamedFactory<Weapon>('Weapon');
container
  .bind<(name: MetadataName) => Weapon>('Factory<Weapon>')
  .toFactory(
    (context: ResolutionContext) => (name: MetadataName) =>
      context.get<Weapon>('Weapon', { name }),
  );

container.bind(Ninja).toSelf();
// End-example
