```ts
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

  public fight(): string {
    return this.#katana.hit();
  }

  public sneak(): string {
    return this.#shuriken.throw();
  }
}

container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('katana');
container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('shuriken');
container
  .bind<interfaces.AutoNamedFactory<Weapon>>('Factory<Weapon>')
  .toAutoNamedFactory<Weapon>('Weapon');

container.bind(Ninja).toSelf();
```
