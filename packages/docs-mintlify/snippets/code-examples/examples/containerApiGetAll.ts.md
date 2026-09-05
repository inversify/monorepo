``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken);

const weapons: Weapon[] = container.getAll<Weapon>('Weapon');
```
