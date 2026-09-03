``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken).whenNamed('ranged');

const weapons: Weapon[] = container.getAll<Weapon>('Weapon');
```
