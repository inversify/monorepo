``` ts
const container: Container = new Container();
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Katana())
  .whenTargetNamed('melee');
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Shuriken())
  .whenTargetNamed('ranged');

const katana: Promise<Weapon> = container.getNamedAsync<Weapon>(
  'Weapon',
  'melee',
);
const shuriken: Promise<Weapon> = container.getNamedAsync<Weapon>(
  'Weapon',
  'ranged',
);
```
