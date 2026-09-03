``` ts
const container: Container = new Container();
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Katana())
  .whenTargetTagged('faction', 'samurai');
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Shuriken())
  .whenTargetTagged('faction', 'ninja');

const katana: Promise<Weapon> = container.getTaggedAsync<Weapon>(
  'Weapon',
  'faction',
  'samurai',
);
const shuriken: Promise<Weapon> = container.getTaggedAsync<Weapon>(
  'Weapon',
  'faction',
  'ninja',
);
```
