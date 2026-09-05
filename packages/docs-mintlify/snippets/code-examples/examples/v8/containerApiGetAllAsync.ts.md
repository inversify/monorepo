``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').toDynamicValue(async () => new Katana());
container.bind<Weapon>('Weapon').to(Shuriken);

const weapons: Promise<Weapon[]> = container.getAllAsync<Weapon>('Weapon');
```
