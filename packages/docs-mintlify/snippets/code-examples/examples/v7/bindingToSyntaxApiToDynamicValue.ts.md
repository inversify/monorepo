``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').toDynamicValue((): Weapon => new Katana());

const katana: Weapon = container.get<Weapon>('Weapon');
```
