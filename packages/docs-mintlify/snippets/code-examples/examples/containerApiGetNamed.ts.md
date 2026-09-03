``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('melee');
container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('ranged');

const katana: Weapon = container.getNamed<Weapon>('Weapon', 'melee');
const shuriken: Weapon = container.getNamed<Weapon>('Weapon', 'ranged');
```
