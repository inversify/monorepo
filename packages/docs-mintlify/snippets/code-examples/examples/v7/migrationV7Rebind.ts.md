``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v7: sync rebind
container.rebindSync<Weapon>('Weapon').to(Shuriken);

const weapon: Weapon = container.get<Weapon>('Weapon');
```
