``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').toConstantValue(new Katana());

const katana: Weapon = container.get<Weapon>('Weapon');
```
