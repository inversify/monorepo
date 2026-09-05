``` ts
@injectable()
class Ninja {
  @inject(weaponServiceId)
  public readonly weapon!: Weapon;
}

const container: Container = new Container();

container.bind(Ninja).toSelf();
container.bind(weaponServiceId).to(Katana);

const ninja: Ninja = container.get(Ninja);

// Returns 10
const ninjaWeaponDamage: number = ninja.weapon.damage;
```
