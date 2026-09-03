``` ts
const parentContainer: Container = new Container();

const container: Container = new Container({
  parent: parentContainer,
});

parentContainer.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken);

// returns Weapon[] with only a Shuriken instance
const weapons: Weapon[] = container.getAll<Weapon>('Weapon', {
  chained: false,
});
```
