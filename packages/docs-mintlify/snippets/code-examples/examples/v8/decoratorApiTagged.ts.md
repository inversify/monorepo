``` ts
@injectable()
class Ninja {
  public katana: Weapon;
  public shuriken: Weapon;
  constructor(
    @inject('Weapon') @tagged('weaponKind', 'melee') katana: Weapon,
    @inject('Weapon') @tagged('weaponKind', 'ranged') shuriken: Weapon,
  ) {
    this.katana = katana;
    this.shuriken = shuriken;
  }
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenTagged('weaponKind', 'melee');
container
  .bind<Weapon>('Weapon')
  .to(Shuriken)
  .whenTagged('weaponKind', 'ranged');
container.bind(Ninja).toSelf();

const ninja: Ninja = container.get(Ninja);
```
