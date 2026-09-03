``` ts
const container: Container = new Container();
container
  .bind<Weapon>('Weapon')
  .to(Katana)
  .whenTargetTagged('faction', 'samurai');
container
  .bind<Weapon>('Weapon')
  .to(Shuriken)
  .whenTargetTagged('faction', 'ninja');

const katana: Weapon = container.getTagged<Weapon>(
  'Weapon',
  'faction',
  'samurai',
);
const shuriken: Weapon = container.getTagged<Weapon>(
  'Weapon',
  'faction',
  'ninja',
);
```
