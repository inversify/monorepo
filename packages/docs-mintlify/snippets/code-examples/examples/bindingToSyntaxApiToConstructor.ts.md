``` ts
const container: Container = new Container();
container.bind<Weapon>('WeaponConstructor').toConstructor(Katana);

const katanaConstructor: interfaces.Newable<Weapon> =
  container.get<interfaces.Newable<Weapon>>('WeaponConstructor');
```
