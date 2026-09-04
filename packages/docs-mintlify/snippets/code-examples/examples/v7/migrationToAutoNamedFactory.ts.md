``` ts
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
```
