``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken);

// returns Weapon[] with both Katana and Shuriken instances
const weapons: Weapon[] = container.getAll<Weapon>('Weapon');
```
