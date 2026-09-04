``` ts
@injectable()
class Ninja {
  public katana: Weapon;
  public shuriken: Weapon | undefined;
  constructor(
    @inject('Katana') katana: Weapon,
    @inject('Shuriken') @optional() shuriken: Weapon | undefined,
  ) {
    this.katana = katana;
    this.shuriken = shuriken;
  }
}

const container: Container = new Container();
container.bind<Weapon>('Katana').to(Katana);

container.bind(Ninja).toSelf();

// Returns a "Ninja" instance with a "Katana" katana property and undefined shuriken property.
const ninja: Ninja = container.get(Ninja);
```
