``` ts
const container: Container = new Container();

// v6: container.bind('WeaponConstructor').toConstructor(Katana);
container.bind<Newable<Weapon>>('WeaponConstructor').toConstantValue(Katana);

export const weaponClass: Newable<Weapon> =
  container.get<Newable<Weapon>>('WeaponConstructor');

export const weapon: Weapon = new weaponClass();
```
