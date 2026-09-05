``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v8: sync rebind (default)
container.rebind<Weapon>('Weapon').to(Shuriken);

const weapon: Weapon = container.get<Weapon>('Weapon');
```
