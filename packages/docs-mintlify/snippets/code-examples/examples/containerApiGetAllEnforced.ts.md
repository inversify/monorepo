``` ts
const container: Container = new Container();
container
  .bind<Weapon>('Weapon')
  .to(Katana)
  .when(() => true);
container
  .bind<Weapon>('Weapon')
  .to(Shuriken)
  .when(() => false);

// returns [new Katana(), new Shuriken()]
const allWeapons: Weapon[] = container.getAll<Weapon>('Weapon');

// returns [new Katana()]
const notAllWeapons: Weapon[] = container.getAll<Weapon>('Weapon', {
  enforceBindingConstraints: true,
});
```
