``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).inSingletonScope();

const firstKatana: Weapon = container.get<Weapon>('Weapon');
const secondKatana: Weapon = container.get<Weapon>('Weapon');

// Returns true
const isSameKatana: boolean = firstKatana === secondKatana;
```
