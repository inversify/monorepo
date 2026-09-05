``` ts
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
```
