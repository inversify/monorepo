``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenNamed('Katana');

const katana: Weapon = container.get<Weapon>('Weapon', { name: 'Katana' });
```
