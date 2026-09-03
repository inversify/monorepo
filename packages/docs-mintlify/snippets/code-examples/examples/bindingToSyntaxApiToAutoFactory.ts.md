``` ts
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

container.bind('Katana').to(Katana);
container.bind('Shuriken').to(Shuriken);

container
  .bind<interfaces.Factory<Katana>>('Factory<Katana>')
  .toAutoFactory<Katana>('Katana');

container.bind(Ninja).toSelf();
```
