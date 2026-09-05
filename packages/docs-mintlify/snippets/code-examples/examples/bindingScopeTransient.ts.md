``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).inTransientScope();

const firstKatana: Weapon = container.get<Weapon>('Weapon');
const secondKatana: Weapon = container.get<Weapon>('Weapon');

// Returns false
const isSameKatana: boolean = firstKatana === secondKatana;
```
