``` ts
const container: Container = new Container();
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Katana())
  .when(() => true);
container
  .bind<Weapon>('Weapon')
  .to(Shuriken)
  .when(() => false);

// returns [new Katana(), new Shuriken()]
const allWeapons: Promise<Weapon[]> = container.getAllAsync<Weapon>('Weapon');

// returns [new Katana()]
const notAllWeapons: Promise<Weapon[]> = container.getAllAsync<Weapon>(
  'Weapon',
  {
    enforceBindingConstraints: true,
  },
);
```
